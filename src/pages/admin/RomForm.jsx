import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { apiGet, apiSend } from "../../api.js";
import Loader from "../../components/Loader.jsx";

const STATUSES = [
  { value: "works", label: "WORKS" },
  { value: "partial", label: "PARTIAL" },
  { value: "broken", label: "BROKEN" },
];

const TEAM_DEVS = ["GustyxPower", "Overissue", "Fufufafa", "Juni", "Pavellc"];

const TELEGRAM_CREDITS_TEMPLATE = `Credits:
• Thanks Xiaomi.eu
• Thanks @Lokcyyy for testing
• Thanks @fufuf4f4a for flashable
• Thanks @Overissueee as helping staff`;

function Field({ label, hint, wide, children }) {
  return (
    <label className={`field${wide ? " field--wide" : ""}`}>
      <div className="field__header">
        <span className="field__label mono-label">{label}</span>
        {hint ? <span className="field__hint mono-label">{hint}</span> : null}
      </div>
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
    maintainer: "",
    credits: "",
    description: "",
    changelog: "",
    flash_guide: "",
    download_url: "",
  });
  const [features, setFeatures] = useState([
    { name: "", status: "works", notes: "" },
  ]);
  const [images, setImages] = useState([]);
  const [downloads, setDownloads] = useState(0);
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
          maintainer: rom.maintainer || "",
          credits: rom.credits || "",
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
        setDownloads(Number(rom.downloads) || 0);
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

  const setMaintainer = (name) => {
    setForm((f) => {
      if (!f.maintainer.trim()) return { ...f, maintainer: name };
      if (f.maintainer.includes(name)) return f;
      return { ...f, maintainer: `${f.maintainer}, ${name}` };
    });
  };

  const insertTemplate = () => {
    setForm((f) => ({
      ...f,
      credits: f.credits.trim()
        ? `${f.credits}\n\n${TELEGRAM_CREDITS_TEMPLATE}`
        : TELEGRAM_CREDITS_TEMPLATE,
    }));
  };

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
      maintainer: form.maintainer.trim(),
      credits: form.credits,
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
          const b = await res.json().catch(() => ({}));
          throw new Error(b.error || "Upload failed");
        }
        const { image } = await res.json();
        setImages((list) => [...list, image]);
      } catch (e) {
        setError(e.message);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  async function deleteImage(id) {
    if (!window.confirm("Delete screenshot permanently?")) return;
    try {
      await apiSend("DELETE", `/api/images/${id}`);
      setImages((list) => list.filter((im) => im.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  if (loading) return <Loader label="LOADING FORM..." />;

  return (
    <form className="form form--spacious" onSubmit={submit}>
      <header className="page__head">
        <div>
          <h1 className="page__title">{isEdit ? "EDIT ROM" : "NEW ROM"}</h1>
          <p className="mono-label page__subtitle">
            {isEdit ? `UPDATING BUILD: ${form.title || routeSlug}` : "CREATE AND PUBLISH A NEW ROM BUILD"}
          </p>
        </div>
        <div className="table__actions">
          {isEdit ? (
            <Link className="mono-label table__link" to={`/rom/${routeSlug}`} target="_blank">
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

      {/* SECTION 1: BASIC INFORMATION */}
      <section className="form__card">
        <div className="form__card-head">
          <h2 className="form__card-title">1. BASIC IDENTIFIERS</h2>
          <span className="mono-label form__card-subtitle">CORE METADATA & DEVELOPER ASSIGNMENT</span>
        </div>

        <div className="form__grid">
          <Field label="ROM TITLE *" hint="REQUIRED">
            <input
              className="input"
              value={form.title}
              onChange={set("title")}
              placeholder="e.g. HyperOS 2.0 Port / Evolution X Official"
              required
            />
          </Field>

          <Field label={isEdit ? "SLUG (FIXED)" : "SLUG (OPTIONAL / AUTO GENERATED)"}>
            <input
              className="input"
              value={form.slug}
              onChange={set("slug")}
              placeholder="e.g. hyperos-2-marble"
              disabled={isEdit}
            />
          </Field>

          {isEdit ? (
            <Field label="TOTAL DOWNLOADS (RECORDED)" hint="AUTOMATICALLY TRACKED">
              <input
                className="input"
                value={`⬇ ${downloads.toLocaleString()} User Download`}
                disabled
              />
            </Field>
          ) : null}

          <Field label="DEVELOPER / MAINTAINER" wide hint="SELECT FROM TEAM OR TYPE MANUALLY">
            <input
              className="input"
              value={form.maintainer}
              onChange={set("maintainer")}
              placeholder="e.g. GustyxPower, Overissue"
            />
            <div className="dev-picker">
              <span className="mono-label dev-picker__label">QUICK ADD TEAM:</span>
              <div className="dev-pills">
                {TEAM_DEVS.map((dev) => (
                  <button
                    key={dev}
                    type="button"
                    className={`dev-pill ${form.maintainer.includes(dev) ? "is-active" : ""}`}
                    onClick={() => setMaintainer(dev)}
                  >
                    + {dev}
                  </button>
                ))}
              </div>
            </div>
          </Field>

          <Field label="DOWNLOAD URL (MIRROR LINK)" wide hint="DIRECT LINK OR EXTERNAL DRIVE">
            <input
              className="input"
              value={form.download_url}
              onChange={set("download_url")}
              placeholder="https://drive.google.com/... or https://mega.nz/..."
            />
          </Field>
        </div>
      </section>

      {/* SECTION 2: SYSTEM SPECIFICATIONS */}
      <section className="form__card">
        <div className="form__card-head">
          <h2 className="form__card-title">2. SYSTEM SPECIFICATIONS</h2>
          <span className="mono-label form__card-subtitle">HARDWARE & SOFTWARE REQUISITES</span>
        </div>

        <div className="form__grid">
          <Field label="ROM VERSION">
            <input
              className="input"
              value={form.version}
              onChange={set("version")}
              placeholder="e.g. v2.0.12 or Official 9.6"
            />
          </Field>

          <Field label="ANDROID VERSION">
            <input
              className="input"
              value={form.android_version}
              onChange={set("android_version")}
              placeholder="e.g. 14, 15, 16"
            />
          </Field>

          <Field label="KERNEL">
            <input
              className="input"
              value={form.kernel}
              onChange={set("kernel")}
              placeholder="e.g. Stock Marble 5.10.x / Perf Kernel"
            />
          </Field>

          <Field label="SOURCE / BASE ROM">
            <input
              className="input"
              value={form.source}
              onChange={set("source")}
              placeholder="e.g. Xiaomi.eu / Redmi Note 12 Turbo / Pixel Experience"
            />
          </Field>
        </div>
      </section>

      {/* SECTION 3: CREDITS & ACKNOWLEDGMENTS */}
      <section className="form__card">
        <div className="form__card-head">
          <div>
            <h2 className="form__card-title">3. CREDITS & ACKNOWLEDGMENTS</h2>
            <p className="mono-label form__card-desc">
              CREDIT BASE AUTHORS, TESTERS, REPOSITORIES & HELPFUL CONTRIBUTORS
            </p>
          </div>
          <button
            type="button"
            className="btn-template mono-label"
            onClick={insertTemplate}
            aria-label="Insert Telegram style credits template"
          >
            📋 INSERT TELEGRAM FORMAT
          </button>
        </div>

        <Field label="CREDITS (ONE ITEM PER LINE OR BULLETS)" wide>
          <textarea
            className="textarea textarea--credits"
            value={form.credits}
            onChange={set("credits")}
            placeholder={`Credits:\n• Thanks Xiaomi.eu\n• Thanks @Lokcyyy for testing\n• Thanks @fufuf4f4a for flashable\n• Thanks @Overissueee as helping staff`}
            rows={5}
          />
        </Field>
      </section>

      {/* SECTION 4: RELEASE DETAILS & GUIDES */}
      <section className="form__card">
        <div className="form__card-head">
          <h2 className="form__card-title">4. DOCUMENTATION & GUIDES</h2>
          <span className="mono-label form__card-subtitle">OVERVIEW, CHANGELOG & FLASH INSTRUCTIONS</span>
        </div>

        <div className="form__stack">
          <Field label="DESCRIPTION / OVERVIEW" wide hint="ONE LINE = ONE PARAGRAPH">
            <textarea
              className="textarea"
              value={form.description}
              onChange={set("description")}
              placeholder="Provide a general overview of this ROM build, feature highlights, and performance notes."
              rows={4}
            />
          </Field>

          <Field label="CHANGELOG (ONE ITEM PER LINE)" wide hint="LIST UPDATES AND FIXES">
            <textarea
              className="textarea"
              value={form.changelog}
              onChange={set("changelog")}
              placeholder={"Rebased on latest Android security patch\nFixed NFC crash in Quick Settings\nOptimized battery drain and idle thermals"}
              rows={5}
            />
          </Field>

          <Field label="FLASH INSTRUCTIONS (ONE STEP PER LINE)" wide hint="STEP-BY-STEP SEQUENCE">
            <textarea
              className="textarea"
              value={form.flash_guide}
              onChange={set("flash_guide")}
              placeholder={"Boot into OrangeFox or TWRP recovery\nWipe Dalvik / ART Cache and Metadata\nFlash ROM zip via adb sideload or internal storage\nFormat Data (Yes) if encrypting\nReboot System"}
              rows={6}
            />
          </Field>
        </div>
      </section>

      {/* SECTION 5: FEATURE STATUS MATRIX */}
      <section className="form__card">
        <div className="form__card-head">
          <div>
            <h2 className="form__card-title">5. FEATURE STATUS MATRIX</h2>
            <p className="mono-label form__card-desc">
              TRANSPARENT DIAGNOSTIC OF WHAT WORKS, PARTIALLY WORKS, OR IS BROKEN
            </p>
          </div>
        </div>

        <div className="fe-rows">
          {features.map((f, i) => (
            <div className="fe-row" key={i}>
              <input
                className="input"
                value={f.name}
                onChange={updFeature(i, "name")}
                placeholder="Feature (e.g. Camera, 5G, Bluetooth)"
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
                placeholder="Notes (optional, e.g. 60fps only)"
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
          + ADD HARDWARE FEATURE
        </button>
      </section>

      {/* SECTION 6: SCREENSHOTS GALLERY */}
      {isEdit && romId ? (
        <section className="form__card">
          <div className="form__card-head">
            <h2 className="form__card-title">6. SCREENSHOTS GALLERY (R2)</h2>
            <span className="mono-label form__card-subtitle">MAX 5MB PER IMAGE</span>
          </div>

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
              <span>{uploading ? `UPLOADING ${uploading}...` : "+ ADD SCREENSHOTS"}</span>
            </label>
          </div>
        </section>
      ) : null}

      <div className="form-actions">
        <Link className="btn btn--outline" to="/admin/dashboard">
          CANCEL
        </Link>
        <button className="btn btn--primary" disabled={saving}>
          {saving ? "SAVING..." : isEdit ? "SAVE CHANGES →" : "CREATE ROM →"}
        </button>
      </div>
    </form>
  );
}
