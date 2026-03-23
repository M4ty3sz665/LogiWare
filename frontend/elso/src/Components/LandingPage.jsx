import React from 'react';

const features = [
  {
    title: 'Mi a LogiWare?',
    description: 'A LogiWare egy modern, felhőalapú rendszer zöldségek és gyümölcsök értékesítéséhez, amely segít átláthatóan kezelni a készletet, rendeléseket és beszállítókat.'
  },
  {
    title: 'Mire jó?',
    description: 'Friss áru készletkezelés, rendeléskövetés, beszállító-nyilvántartás, készletmozgások naplózása, riportok és jogosultságkezelés.'
  },
  {
    title: 'Előnyök',
    description: 'Gyors, mobilbarát, egyszerűen használható, biztonságos, felhőalapú, skálázható.'
  },
  {
    title: 'Hogyan kezdjem el?',
    description: 'Regisztrálj, próbáld ki a demót, vagy olvasd el a dokumentációt!'
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-5xl font-extrabold text-blue-900 mb-4 drop-shadow-lg">LogiWare</h1>
        <p className="text-xl text-blue-700 mb-8">Zöldség- és gyümölcskereskedelemre szabott készlet- és rendeléskezelés</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {features.map((f, i) => (
            <div key={i} className="bg-white/90 rounded-xl shadow-lg p-6 border border-blue-100">
              <h2 className="text-2xl font-bold text-blue-800 mb-2">{f.title}</h2>
              <p className="text-blue-700 text-base">{f.description}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
          <a href="/login" className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition">Belépés</a>
          <a href="/register" className="px-8 py-3 bg-white border border-blue-600 text-blue-700 rounded-lg font-semibold shadow hover:bg-blue-50 transition">Regisztráció</a>
          <a href="https://github.com/M4ty3sz665/LogiWare" target="_blank" rel="noopener noreferrer" className="px-8 py-3 bg-gray-100 border border-gray-300 text-gray-700 rounded-lg font-semibold shadow hover:bg-gray-200 transition">Dokumentáció</a>
        </div>
        <div className="mt-8">
          <img src="/assets/dashboard_demo.png" alt="Dashboard demo" className="mx-auto rounded-xl shadow-lg border border-blue-100 max-h-80" />
          <p className="text-xs text-blue-400 mt-2">Képernyőkép a LogiWare zöldség-gyümölcs dashboardról</p>
        </div>
      </div>
    </div>
  );
}
