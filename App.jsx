import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, MapPin, Star, Plus, X, ChevronRight, User, Store, LogOut, Trash2 } from "lucide-react";
import { api } from "./api.js";

function gradeFor(avg, count) {
  if (!count) return { label: "NEW", color: "var(--bark)" };
  if (avg >= 4.5) return { label: "A+", color: "var(--green)" };
  if (avg >= 3.5) return { label: "A", color: "var(--green)" };
  if (avg >= 2.5) return { label: "B", color: "var(--ochre)" };
  return { label: "C", color: "var(--red)" };
}

function StarRow({ value, onChange, size = 16 }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange && onChange(n)}
          style={{ background: "none", border: "none", padding: 0 }}
          aria-label={`${n} star`}
        >
          <Star size={size} color="var(--ochre)" fill={n <= value ? "var(--ochre)" : "none"} />
        </button>
      ))}
    </div>
  );
}

function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "grower" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    setError("");
    setBusy(true);
    try {
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, password: form.password, role: form.role };
      const data = mode === "login" ? await api.login(payload) : await api.register(payload);
      api.setToken(data.token);
      onAuthed(data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const valid =
    mode === "login"
      ? form.email.trim() && form.password
      : form.name.trim() && form.email.trim() && form.password.length >= 8;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="card" style={{ maxWidth: 380, width: "100%", padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div className="stamp" style={{ width: 40, height: 40, color: "var(--green)" }}>
            <span className="stamp-label" style={{ fontSize: 13 }}>B</span>
          </div>
          <h1 className="display" style={{ fontSize: 26, margin: 0, color: "var(--green-dark)" }}>Bushel</h1>
        </div>
        <p style={{ fontSize: 13, color: "var(--bark)", marginTop: 0, marginBottom: 20 }}>
          A buyer directory and ledger for apple growers.
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          {["login", "register"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={mode === m ? "btn-secondary" : "btn-ghost"}
              style={{ flex: 1, padding: "8px 0" }}
            >
              {m === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>

        {mode === "register" && (
          <div style={{ marginBottom: 12 }}>
            <label className="field-label">Full name</label>
            <div style={{ marginTop: 4 }}>
              <input value={form.name} onChange={set("name")} placeholder="e.g. Marta Solheim" />
            </div>
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <label className="field-label">Email</label>
          <div style={{ marginTop: 4 }}>
            <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label className="field-label">Password</label>
          <div style={{ marginTop: 4 }}>
            <input type="password" value={form.password} onChange={set("password")} placeholder={mode === "register" ? "At least 8 characters" : "••••••••"} />
          </div>
        </div>

        {mode === "register" && (
          <div style={{ marginBottom: 18 }}>
            <label className="field-label">You are a</label>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              {[
                { key: "grower", label: "Grower", icon: User },
                { key: "buyer", label: "Buyer", icon: Store },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setForm({ ...form, role: key })}
                  className={form.role === key ? "btn-secondary" : "btn-ghost"}
                  style={{ flex: 1, padding: "10px 8px", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                >
                  <Icon size={15} /><span style={{ fontSize: 13 }}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="error-text" style={{ marginBottom: 12 }}>{error}</p>}

        <button disabled={!valid || busy} onClick={submit} className="btn-primary" style={{ width: "100%", padding: "11px 0" }}>
          {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
        </button>
      </div>
    </div>
  );
}

function BuyerCard({ buyer, onOpen }) {
  const grade = gradeFor(buyer.avgRating, buyer.reviewCount);
  return (
    <div className="card" onClick={onOpen} style={{ padding: 18, cursor: "pointer", display: "flex", gap: 14 }}>
      <div className="stamp" style={{ color: grade.color }}>
        <span className="stamp-label">{grade.label}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 className="display" style={{ margin: 0, fontSize: 18, color: "var(--green-dark)" }}>{buyer.name}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3, color: "var(--bark)", fontSize: 12.5 }}>
          <MapPin size={12} /><span>{buyer.location || "Location not listed"}</span>
        </div>
        <p style={{ fontSize: 13, margin: "8px 0 6px" }}>{buyer.cropsWanted}</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          <span className="mono" style={{ fontSize: 12.5, color: "var(--green)" }}>{buyer.priceRange}</span>
          <span style={{ fontSize: 12, color: "var(--bark)", display: "flex", alignItems: "center", gap: 4 }}>
            {buyer.reviewCount} review{buyer.reviewCount === 1 ? "" : "s"} <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </div>
  );
}

function AddBuyerForm({ onSave, onClose }) {
  const [f, setF] = useState({ name: "", location: "", cropsWanted: "", priceRange: "", paymentTerms: "", contact: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const valid = f.name.trim() && f.cropsWanted.trim();

  const submit = async () => {
    setBusy(true);
    setError("");
    try {
      await onSave(f);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="card modal-sheet">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 className="display" style={{ margin: 0, fontSize: 20, color: "var(--green-dark)" }}>List a buyer</h2>
          <button onClick={onClose} style={{ background: "none", border: "none" }}><X size={20} /></button>
        </div>

        {[
          ["name", "Buyer name", "e.g. Ridgeline Fresh Pack"],
          ["location", "Location", "City, State"],
          ["cropsWanted", "Varieties / crops wanted", "e.g. Honeycrisp, Gala, culls for cider"],
          ["priceRange", "Price range", "e.g. $0.30–$0.45 / lb"],
          ["paymentTerms", "Payment terms", "e.g. Net 30, check on delivery"],
          ["contact", "Contact info", "email or phone"],
        ].map(([key, label, placeholder]) => (
          <div key={key} style={{ marginBottom: 12 }}>
            <label className="field-label">{label}</label>
            <div style={{ marginTop: 4 }}>
              <input value={f[key]} onChange={set(key)} placeholder={placeholder} />
            </div>
          </div>
        ))}

        {error && <p className="error-text" style={{ marginBottom: 10 }}>{error}</p>}

        <button disabled={!valid || busy} onClick={submit} className="btn-secondary" style={{ width: "100%", padding: "12px 0", marginTop: 4 }}>
          {busy ? "Saving…" : "Save listing"}
        </button>
      </div>
    </div>
  );
}

function BuyerDetail({ buyerId, user, onClose, onChanged }) {
  const [buyer, setBuyer] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const data = await api.getBuyer(buyerId);
    setBuyer(data);
  }, [buyerId]);

  useEffect(() => { load(); }, [load]);

  if (!buyer) return null;

  const grade = gradeFor(buyer.avgRating, buyer.reviewCount);
  const alreadyReviewed = buyer.reviews.some((r) => r.growerName === user.name);
  const canReview = user.role === "grower" && !alreadyReviewed;
  const isOwner = buyer.addedById === user.id;

  const submitReview = async () => {
    if (!rating) return;
    setBusy(true);
    setError("");
    try {
      await api.addReview(buyerId, { rating, comment: comment.trim() });
      setRating(0);
      setComment("");
      await load();
      onChanged();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const removeBuyer = async () => {
    if (!confirm(`Remove ${buyer.name} from the directory?`)) return;
    await api.deleteBuyer(buyerId);
    onChanged();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="card modal-sheet">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div className="stamp" style={{ color: grade.color }}><span className="stamp-label">{grade.label}</span></div>
            <div>
              <h2 className="display" style={{ margin: 0, fontSize: 21, color: "var(--green-dark)" }}>{buyer.name}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3, color: "var(--bark)", fontSize: 12.5 }}>
                <MapPin size={12} /><span>{buyer.location || "Location not listed"}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none" }}><X size={20} /></button>
        </div>

        <div className="card" style={{ padding: 14, marginBottom: 18 }}>
          {[
            ["Crops wanted", buyer.cropsWanted],
            ["Price range", buyer.priceRange || "—", true],
            ["Payment terms", buyer.paymentTerms || "—"],
            ["Contact", buyer.contact || "—"],
          ].map(([label, value, isMono], i) => (
            <div key={label} className={i < 3 ? "ledger-row" : ""} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
              <span className="field-label">{label}</span>
              <span className={isMono ? "mono" : ""} style={{ fontSize: 13.5, textAlign: "right", maxWidth: "60%", color: isMono ? "var(--green)" : "var(--ink)" }}>{value}</span>
            </div>
          ))}
        </div>

        {isOwner && (
          <button onClick={removeBuyer} className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", marginBottom: 18, color: "var(--red)" }}>
            <Trash2 size={14} /> Remove this listing
          </button>
        )}

        <h3 className="display" style={{ fontSize: 16, color: "var(--green-dark)", marginBottom: 8 }}>Reviews ({buyer.reviewCount})</h3>
        {buyer.reviews.length === 0 && <p style={{ fontSize: 13, color: "var(--bark)", marginBottom: 16 }}>No reviews yet — be the first grower to weigh in.</p>}
        <div style={{ marginBottom: 18 }}>
          {buyer.reviews.map((r) => (
            <div key={r.id} className="ledger-row" style={{ padding: "10px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{r.growerName}</span>
                <StarRow value={r.rating} size={13} />
              </div>
              {r.comment && <p style={{ fontSize: 13, margin: "5px 0 0" }}>{r.comment}</p>}
              <span className="mono" style={{ fontSize: 11, color: "var(--bark)" }}>{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>

        {user.role === "grower" ? (
          canReview ? (
            <div className="card" style={{ padding: 14 }}>
              <label className="field-label">Rate this buyer</label>
              <div style={{ margin: "8px 0 10px" }}><StarRow value={rating} onChange={setRating} size={20} /></div>
              <textarea rows={3} placeholder="How was pricing, payment reliability, communication?" value={comment} onChange={(e) => setComment(e.target.value)} style={{ marginBottom: 10 }} />
              {error && <p className="error-text" style={{ marginBottom: 10 }}>{error}</p>}
              <button disabled={!rating || busy} onClick={submitReview} className="btn-primary" style={{ width: "100%", padding: "10px 0" }}>
                {busy ? "Posting…" : `Post review as ${user.name}`}
              </button>
            </div>
          ) : (
            <p style={{ fontSize: 12.5, color: "var(--bark)" }}>You've already reviewed this buyer.</p>
          )
        ) : (
          <p style={{ fontSize: 12.5, color: "var(--bark)" }}>Only growers can post reviews.</p>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [buyers, setBuyers] = useState([]);
  const [loadingBuyers, setLoadingBuyers] = useState(true);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("rank");
  const [showAdd, setShowAdd] = useState(false);
  const [openBuyerId, setOpenBuyerId] = useState(null);
  const [error, setError] = useState("");

  // Restore session by re-checking token validity against a lightweight call.
  useEffect(() => {
    const token = api.getToken();
    const stored = localStorage.getItem("bushel_user");
    if (token && stored) {
      try { setUser(JSON.parse(stored)); } catch { api.clearToken(); }
    }
    setCheckingSession(false);
  }, []);

  const refreshBuyers = useCallback(async () => {
    setLoadingBuyers(true);
    try {
      const data = await api.listBuyers({ search: query, sort: sortBy });
      setBuyers(data);
      setError("");
    } catch (e) {
      setError("Couldn't reach the server. Is the backend running on port 4000?");
    } finally {
      setLoadingBuyers(false);
    }
  }, [query, sortBy]);

  useEffect(() => {
    if (user) refreshBuyers();
  }, [user, refreshBuyers]);

  const handleAuthed = (u) => {
    localStorage.setItem("bushel_user", JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    api.clearToken();
    localStorage.removeItem("bushel_user");
    setUser(null);
  };

  const saveBuyer = async (form) => {
    await api.createBuyer(form);
    setShowAdd(false);
    await refreshBuyers();
  };

  const filtered = useMemo(() => buyers, [buyers]);

  if (checkingSession) return <div style={{ minHeight: "100vh" }} />;
  if (!user) return <AuthScreen onAuthed={handleAuthed} />;

  return (
    <div style={{ paddingBottom: 40 }}>
      <div className="header">
        <div className="container header-inner">
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div className="stamp" style={{ width: 30, height: 30, color: "#EDE0BE" }}><span className="stamp-label" style={{ fontSize: 11 }}>B</span></div>
            <h1 className="display" style={{ margin: 0, fontSize: 19, color: "#FBF7EC" }}>Bushel</h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "#D8CFB8" }}>{user.name} · {user.role}</span>
            <button onClick={logout} style={{ background: "none", border: "none", color: "#D8CFB8", display: "flex" }}><LogOut size={16} /></button>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: 16 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 10, top: 11, color: "var(--bark)" }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search buyers, varieties, location" style={{ paddingLeft: 30 }} />
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary" style={{ padding: "0 14px", display: "flex", alignItems: "center", gap: 5 }}>
            <Plus size={15} /> Add
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 16, alignItems: "center" }}>
          <span className="field-label">Sort</span>
          {[["rank", "Top rated"], ["reviews", "Most reviewed"], ["name", "Name"]].map(([key, label]) => (
            <button key={key} onClick={() => setSortBy(key)} className={sortBy === key ? "btn-secondary" : "btn-ghost"} style={{ fontSize: 12, padding: "5px 10px" }}>
              {label}
            </button>
          ))}
        </div>

        {error && <p className="error-text" style={{ marginBottom: 10 }}>{error}</p>}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {!loadingBuyers && filtered.map((b) => (
            <BuyerCard key={b.id} buyer={b} onOpen={() => setOpenBuyerId(b.id)} />
          ))}
          {!loadingBuyers && filtered.length === 0 && !error && (
            <p style={{ fontSize: 13, color: "var(--bark)", textAlign: "center", padding: "30px 0" }}>
              No buyers match that search yet — try adding one.
            </p>
          )}
        </div>
      </div>

      {showAdd && <AddBuyerForm onSave={saveBuyer} onClose={() => setShowAdd(false)} />}
      {openBuyerId && (
        <BuyerDetail buyerId={openBuyerId} user={user} onClose={() => setOpenBuyerId(null)} onChanged={refreshBuyers} />
      )}
    </div>
  );
}
