import { useEffect, useState } from "react";

export default function UserCard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("https://example.com/api/user/1");
        if (!res.ok) throw new Error(`Ошибка ${res.status}`);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Не удалось получить данные:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  // 👇 разные сценарии отображения

  if (loading) {
    return (
      <div className="p-6 border rounded-2xl text-center">
        <p>Загрузка данных...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border rounded-2xl text-center bg-red-50 text-red-700">
        <h2 className="text-xl font-semibold mb-2">Увы 😢</h2>
        <p>Не удалось получить данные с сервера.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  // основной JSX — рендерится только если всё ок
  return (
    <div className="max-w-sm p-4 border rounded-2xl shadow-sm">
      <img
        src={user.avatar}
        alt={user.name}
        className="w-24 h-24 rounded-full mx-auto"
      />
      <h2 className="text-xl text-center mt-3">{user.name}</h2>
      <p className="text-center text-gray-500">{user.email}</p>
    </div>
  );
}
