"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "../lib/firestore";

const PIN = "1234";

/* DEFAULT SERVICES (8) */
const defaultServices = [
  { name: "Striženje", price: 30, color: "#ff4da6" },
  { name: "Barvanje", price: 60, color: "#7c4dff" },
  { name: "Fen frizura", price: 25, color: "#00c2ff" },
  { name: "Manikura", price: 35, color: "#ffb703" },
  { name: "Pedikura", price: 40, color: "#8ecae6" },
  { name: "Lash lift", price: 45, color: "#219ebc" },
  { name: "Makeup", price: 70, color: "#fb6f92" },
  { name: "Obrvi", price: 20, color: "#8338ec" }
];

/* SMS TEMPLATES */
const defaultSms = [
  "Pozdravljeni, vaš termin je potrjen 💅",
  "Opomnik: imate termin jutri ob {time} 💄",
  "Hvala za obisk 💕 Veselimo se ponovnega srečanja"
];

const calendarFix = `
.react-calendar {
  width: 100%;
  border: none;
  font-family: Arial;
}

.react-calendar button {
  color: black;
}

.react-calendar__tile--active {
  background: #ff4da6 !important;
  color: white !important;
}
`;

export default function Home() {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  /* NAVIGATION */
  const [tab, setTab] = useState("booking");

  /* BOOKING */
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [service, setService] = useState<any>(null);

  /* DATA */
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState(defaultServices);
  const [sms, setSms] = useState(defaultSms);

  /* LIVE FIREBASE */
  useEffect(() => {
    if (!unlocked) return;

    const unsub = onSnapshot(collection(db, "appointments"), (snap) => {
      setAppointments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [unlocked]);

  const login = () => {
    if (pin === PIN) setUnlocked(true);
    else alert("Wrong PIN");
  };

  const book = async () => {
    if (!name || !time || !service) return;

    await addDoc(collection(db, "appointments"), {
      name,
      date: date.toDateString(),
      time,
      service: service.name,
      price: service.price,
      color: service.color
    });

    setName("");
    setTime("");
    setService(null);
  };

  const addService = () => {
    setServices([
      ...services,
      {
        name: "Nova storitev",
        price: 0,
        color: "#ff4da6"
      }
    ]);
  };

  const updateSms = (index: number, value: string) => {
    const copy = [...sms];
    copy[index] = value;
    setSms(copy);
  };

  const times = [
    "06:00","06:30","07:00","07:30","08:00","08:30",
    "09:00","09:30","10:00","10:30","11:00","11:30",
    "12:00","12:30","13:00","13:30","14:00","14:30",
    "15:00","15:30","16:00","16:30","17:00","17:30",
    "18:00","18:30","19:00","19:30","20:00","20:30",
    "21:00","21:30","22:00"
  ];

  if (!unlocked) {
    return (
      <main style={styles.screen}>
        <div style={styles.card}>
          <h2>💅 GOLDIE PRO</h2>

          <input
            type="password"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={styles.input}
          />

          <button onClick={login} style={styles.button}>
            Enter
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.screen}>
      <div style={styles.app}>

        <style>{calendarFix}</style>

        {/* NAV */}
        <div style={styles.nav}>
          <button onClick={() => setTab("booking")}>📅 Booking</button>
          <button onClick={() => setTab("services")}>💄 Services</button>
          <button onClick={() => setTab("settings")}>⚙️ Settings</button>
        </div>

        {/* ================= BOOKING ================= */}
        {tab === "booking" && (
          <>
            <h3>Booking</h3>

            <Calendar value={date} onChange={(v: any) => setDate(v)} />

            <input
              placeholder="Ime stranke"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
            />

            <div style={styles.services}>
              {services.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setService(s)}
                  style={{
                    ...styles.serviceBtn,
                    background: service?.name === s.name ? s.color : "#eee"
                  }}
                >
                  {s.name} ({s.price}€)
                </button>
              ))}
            </div>

            <div style={styles.times}>
              {times.map((t) => {
                const taken = appointments.some(
                  (a) => a.date === date.toDateString() && a.time === t
                );

                return (
                  <button
                    key={t}
                    disabled={taken}
                    onClick={() => setTime(t)}
                    style={{
                      ...styles.timeBtn,
                      background: taken ? "#ccc" : time === t ? "#ff4da6" : "#f5f5f5"
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>

            <button onClick={book} style={styles.save}>
              Shrani
            </button>
          </>
        )}

        {/* ================= SERVICES ================= */}
        {tab === "services" && (
          <>
            <h3>💄 Services</h3>

            <button onClick={addService} style={styles.addBtn}>
              + Add service
            </button>

            {services.map((s, i) => (
              <div key={i} style={styles.serviceRow}>
                <input
                  value={s.name}
                  onChange={(e) => {
                    const copy = [...services];
                    copy[i].name = e.target.value;
                    setServices(copy);
                  }}
                />

                <input
                  type="number"
                  value={s.price}
                  onChange={(e) => {
                    const copy = [...services];
                    copy[i].price = Number(e.target.value);
                    setServices(copy);
                  }}
                />

                <input
                  type="color"
                  value={s.color}
                  onChange={(e) => {
                    const copy = [...services];
                    copy[i].color = e.target.value;
                    setServices(copy);
                  }}
                />
              </div>
            ))}
          </>
        )}

        {/* ================= SETTINGS ================= */}
        {tab === "settings" && (
          <>
            <h3>⚙️ SMS Templates</h3>

            {sms.map((s, i) => (
              <textarea
                key={i}
                value={s}
                onChange={(e) => updateSms(i, e.target.value)}
                style={styles.sms}
              />
            ))}
          </>
        )}

      </div>
    </main>
  );
}

/* STYLES */
const styles: any = {
  screen: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    fontFamily: "Arial",
    background: "#fff"
  },

  card: {
    marginTop: 120,
    padding: 20,
    width: 260,
    background: "#f5f5f5",
    borderRadius: 16,
    textAlign: "center"
  },

  app: {
    width: "100%",
    maxWidth: 420,
    padding: 16
  },

  nav: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10
  },

  input: {
    width: "100%",
    padding: 10,
    margin: "10px 0"
  },

  button: {
    width: "100%",
    padding: 12,
    background: "#ff4da6",
    color: "#fff",
    border: "none",
    borderRadius: 10
  },

  services: {
    display: "grid",
    gap: 6
  },

  serviceBtn: {
    padding: 10,
    border: "none",
    borderRadius: 10
  },

  serviceRow: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    gap: 6,
    marginBottom: 6
  },

  times: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 6,
    marginTop: 10
  },

  timeBtn: {
    padding: 10,
    border: "none",
    borderRadius: 10
  },

  save: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    background: "#ff4da6",
    color: "#fff",
    border: "none",
    borderRadius: 10
  },

  addBtn: {
    width: "100%",
    padding: 10,
    marginBottom: 10
  },

  sms: {
    width: "100%",
    height: 60,
    marginBottom: 10
  }
};