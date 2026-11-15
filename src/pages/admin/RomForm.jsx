import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { apiGet, apiSend } from "../../api.js";
import Loader from "../../components/Loader.jsx";

const STATUSES = [
  { value: "works", label: "WORKS" },
  { value: "partial", label: "PARTIAL" },
  { value: "broken", label: "BROKEN" },
];

function Field({ label, wide, children }) {
  return (
    <label className={`field${wide ? " field--wide" : ""}`}>
      <span className="field__label mono-label">{label}</span>
      {children}
    </label>
  );
}

export default function RomForm({ mode }) {
  const { slug: routeSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const justCreated = Boolean(location.state?.justCreated);
  const isEdit = mode === "edit" || Boolean(routeSlug);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    version: "",
    android_version: "",
    kernel: "",
    source: "",
    description: "",
    changelog: "",
    flash_guide: "",
    download_url: "",
  });
  const [features, setFeatures] = useState([
    { name: "", status: "works", notes: "" },
  ]);
  const [images, setImages] = useState([]);
  const [romId, setRomId] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(
    justCreated ? "ROM CREATED / UPLOAD SCREENSHOTS BELOW" : null
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);
  const fileRef = useRef();

  useEffect(() => {
    if (!isEdit) return;
    let live = true;
    apiGet(`/api/roms/${routeSlug}`)
      .then(({ rom }) => {
        if (!live) return;
        setForm({
          title: rom.title || "",
          slug: rom.slug || "",
          version: rom.version || "",
          android_version: rom.android_version || "",
          kernel: rom.kernel || "",
          source: rom.source || "",
          description: rom.description || "",
          changelog: rom.changelog || "",
          flash_guide: rom.flash_guide || "",
          download_url: rom.download_url || "",
        });
        setFeatures(
          rom.features?.length
            ? rom.features.map((f) => ({
                name: f.name,
                status: f.status,
                notes: f.notes || "",
              }))
            : [{ name: "", status: "works", notes: "" }]
        );
        setImages(rom.images || []);
        setRomId(rom.id);
        setLoading(false);
      })
      .catch((e) => {
        if (live) {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => {
      live = false;
    };
  }, [isEdit, routeSlug]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const updFeature = (i, key) => (e) =>
    setFeatures((list) =>
      list.map((f, idx) => (idx === i ? { ...f, [key]: e.target.value } : f))
    );
  const addFeature = () =>
    setFeatures((list) => [...list, { name: "", status: "works", notes: "" }]);
  const removeFeature = (i) =>
    setFeatures((list) => list.filter((_, idx) => idx !== i));

  async function submit(e) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      version: form.version.trim(),
      android_version: form.android_version.trim(),
      kernel: form.kernel.trim(),
      source: form.source.trim(),
      description: form.description,
      changelog: form.changelog,
      flash_guide: form.flash_guide,
      download_url: form.download_url.trim(),
      features: features
        .filter((f) => f.name.trim())
        .map((f) => ({
          name: f.name.trim(),
          status: f.status,
          notes: f.notes.trim(),
        })),
    };
    setSaving(true);
    try {
      if (isEdit) {
        await apiSend("PUT", `/api/roms/${routeSlug}`, payload);
        navigate("/admin/dashboard");
      } else {
        const { rom } = await apiSend("POST", "/api/roms", payload);
        navigate(`/admin/roms/${rom.slug}/edit`, {
          replace: true,
          state: { justCreated: true },
        });
      }
    } catch (e2) {
      setError(e2.message);
      setSaving(false);
    }
  }

  async function uploadFiles(files) {
    if (!files?.length || !romId) return;
    setError(null);
    setUploading(files.length);
    let ok = 0;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setError(`SKIPPED ${file.name} / NOT AN IMAGE FILE`);
        setUploading((n) => n - 1);
        continue;
      }
      try {
        const fd = new FormData();
        fd.append("romId", String(romId));
        fd.append("file", file);
        const res = await fetch("/api/images", {
          method: "POST",
          credentials: "same-origin",
          body: fd,
        });
        if (!res.ok) {
          const d = await res.json().catch(() => null);
          setError(d?.error || `UPLOAD GAGAL: ${file.name}`);
        } else {
          const d = await res.json();
          setImages((list) => [
            ...list,
            { id: d.image.id, object_key: d.image.object_key },
          ]);
          ok += 1;
        }
      } catch {
        setError(`UPLOAD GAGAL: ${file.name}`);
      }
      setUploading((n) => Math.max(0, n - 1));
    }
    if (fileRef.current) fileRef.current.value = "";
    if (ok) setNotice(`${ok} IMAGE(S) TERUPLOAD`);
  }

  async function deleteImage(id) {
    try {
      await apiSend("DELETE", `/api/images/${id}`);
      setImages((list) => list.filter((i) => i.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  if (loading) return <Loader />;

  return (
    <form className="form" onSubmit={submit}>
      <header className="page__head">
        <h1 className="page__title">{isEdit ? "EDIT ROM" : "NEW ROM"}</h1>
        <div className="table__actions">
          {isEdit ? (
            <Link className="mono-label table__link" to={`/rom/${routeSlug}`}>
              PREVIEW ↗
            </Link>
          ) : null}
          <Link className="mono-label table__link" to="/admin/dashboard">
            CANCEL
          </Link>
        </div>
      </header>

      {notice ? <p className="notice">{notice}</p> : null}
      {error ? <p className="error-box mono-label">{error}</p> : null}

      <div className="form__grid">
        <Field label="TITLE *">
          <input
            className="input"
            value={form.title}
            onChange={set("title")}
            placeholder="XTRA ULTRA PORT"
            required
          />
        </Field>
        <Field label={isEdit ? "SLUG (FIXED)" : "SLUG (OPTIONAL / AUTO FROM TITLE)"}>
          <input
            className="input"
            value={form.slug}
            onChange={set("slug")}
            placeholder="xtra-ultra-port"
            disabled={isEdit}
          />
        </Field>
        <Field label="VERSION">
          <input
            className="input"
            value={form.version}
            onChange={set("version")}
            placeholder="v3.2"
          />
        </Field>
        <Field label="ANDROID VERSION">
          <input
            className="input"
            value={form.android_version}
            onChange={set("android_version")}
            placeholder="16"
          />
        </Field>
        <Field label="KERNEL">
          <input
            className="input"
            value={form.kernel}
            onChange={set("kernel")}
            placeholder="Stock marble 6.1"
          />
        </Field>
        <Field label="SOURCE ROM">
          <input
            className="input"
            value={form.source}
            onChange={set("source")}
            placeholder="Xtra Ultra (Redmi Note 12 Pro 5G)"
          />
        </Field>
        <Field label="DOWNLOAD URL (MIRROR)">
          <input
            className="input"
            value={form.download_url}
            onChange={set("download_url")}
            placeholder="https://…"
          />
        </Field>
        <Field label="DESCRIPTION" wide>
          <textarea
            className="textarea"
            value={form.description}
            onChange={set("description")}
            placeholder="Satu baris = satu paragraf."
            rows={4}
          />
        </Field>
        <Field label="CHANGELOG (SATU ITEM PER BARIS)" wide>
          <textarea
            className="textarea"
            value={form.changelog}
            onChange={set("changelog")}
            placeholder={"Rebase ke Android 16\nFixed NFC toggle crash"}
            rows={5}
          />
        </Field>
        <Field label="FLASH INSTRUCTIONS (SATU STEP PER BARIS)" wide>
          <textarea
            className="textarea"
            value={form.flash_guide}
            onChange={set("flash_guide")}
            placeholder={"Unlock bootloader\nfastboot flash recovery recovery.img\nadb sideload rom.zip"}
            rows={6}
          />
        </Field>
      </div>

      <section className="form__section">
        <h2 className="block__title">STATUS DOKUMENTASI FITUR</h2>
        <div className="fe-rows">
          {features.map((f, i) => (
            <div className="fe-row" key={i}>
              <input
                className="input"
                value={f.name}
                onChange={updFeature(i, "name")}
                placeholder="e.g. WiFi"
                aria-label="Feature name"
              />
              <select
                className="select"
                value={f.status}
                onChange={updFeature(i, "status")}
                aria-label="Feature status"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <input
                className="input"
                value={f.notes}
                onChange={updFeature(i, "notes")}
                placeholder="notes (opsional)"
                aria-label="Feature notes"
              />
              <button
                type="button"
                className="fe-x"
                onClick={() => removeFeature(i)}
                aria-label="Remove feature"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="btn btn--sm btn--cyan" onClick={addFeature}>
          + ADD FEATURE
        </button>
      </section>

      {isEdit && romId ? (
        <section className="form__section">
          <h2 className="block__title">SCREENSHOTS (R2)</h2>
          <div className="img-grid">
            {images.map((im) => (
              <figure className="img-cell" key={im.id}>
                <img src={`/images/${im.object_key}`} alt="" />
                <button
                  type="button"
                  onClick={() => deleteImage(im.id)}
                  aria-label="Delete image"
                >
                  ✕
                </button>
              </figure>
            ))}
            <label className="img-add">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => uploadFiles(e.target.files)}
              />
              <span>{uploading ? `UPLOADING ${uploading}...` : "+ ADD IMAGES"}</span>
            </label>
          </div>
        </section>
      ) : null}

      <div className="form-actions">
        <Link className="btn btn--sm btn--outline" to="/admin/dashboard">
          CANCEL
        </Link>
        <button className="btn btn--primary" disabled={saving}>
          {saving ? "SAVING..." : isEdit ? "SAVE CHANGES →" : "CREATE ROM →"}
        </button>
      </div>
    </form>
  );
}
