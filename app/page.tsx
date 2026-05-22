"use client";

import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "../lib/firestore";

const PIN = "1234";

/* SERVICES */
const services = [
  { name: "Striženje", price: 30, color: "#ff4da6" },
  { name: "Barvanje", price: 60, color: "#7c4dff" },
  { name: "Manikura", price: 40, color: "#00c2ff" }
];

/* CALENDAR FIX */
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

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [service, setService] = useState<any>(null);

  const [appointments, setAppointments] = useState<any[]>([]);

  /* LIVE DATA */
  useEffect(() => {
    if (!unlocked) return;

    const unsub = onSnapshot(collection(db, "appointments"), (snap) => {
      setAppointments(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
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

  const times = [
    "06:00","06:30","07:00","07:30","08:00","08:30",
    "09:00","09:30","10:00","10:30","11:00","11:30",
    "12:00","12:30","13:00","13:30","14:00","14:30",
    "15:00","15:30","16:00","16:30","17:00","17:30",
    "18:00","18:30","19:00","19:30","20:00","20:30",
    "21:00","21:30","22:00"
  ];

  /* LOGIN SCREEN */
  if (!unlocked) {
    return (
      <main style={styles.screen}>
        <div style={styles.card}>
          <h2>💅 SALON PRO</h2>

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

  /* REVENUE */
  const totalRevenue = appointments.reduce(
    (sum, a) => sum + (a.price || 0),
    0
  );

  return (
    <main style={styles.screen}>
      <div style={styles.app}>

        <style>{calendarFix}</style>

        <h2>💄 Salon Dashboard</h2>

        {/* REVENUE DASHBOARD */}
        <div style={styles.dashboard}>
          💰 Skupaj: {totalRevenue}€
        </div>

        {/* CALENDAR */}
        <Calendar onChange={(v: any) => setDate(v)} value={date} />

        {/* SERVICES */}
        <h3>Storitve</h3>
        <div style={styles.services}>
          {services.map((s) => (
            <button
              key={s.name}
              onClick={() => setService(s)}
              style={{
                ...styles.serviceBtn,
                background: service?.name === s.name ? s.color : "#eee",
                color: service?.name === s.name ? "#fff" : "#000",
              }}
            >
              {s.name} ({s.price}€)
            </button>
          ))}
        </div>

        {/* NAME */}
        <input
          placeholder="Stranka"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />

        {/* TIMES */}
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
                  background: taken
                    ? "#ccc"
                    : time === t
                    ? "#ff4da6"
                    : "#f5f5f5",
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
    background: "#fff",
  },

  card: {
    marginTop: 120,
    padding: 20,
    width: 260,
    background: "#f5f5f5",
    borderRadius: 16,
    textAlign: "center",
  },

  app: {
    width: "100%",
    maxWidth: 420,
    padding: 16,
  },

  dashboard: {
    padding: 10,
    background: "#000",
    color: "#fff",
    borderRadius: 10,
    marginBottom: 10,
  },

  input: {
    width: "100%",
    padding: 10,
    margin: "10px 0",
  },

  button: {
    width: "100%",
    padding: 12,
    background: "#ff4da6",
    color: "#fff",
    border: "none",
    borderRadius: 10,
  },

  services: {
    display: "grid",
    gap: 6,
  },

  serviceBtn: {
    padding: 10,
    border: "none",
    borderRadius: 10,
  },

  times: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: 6,
    marginTop: 10,
  },

  timeBtn: {
    padding: 10,
    border: "none",
    borderRadius: 10,
  },

  save: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    background: "#ff4da6",
    color: "#fff",
    border: "none",
    borderRadius: 10,
  },
};