export async function loadData() {
  const res = await fetch("http://localhost:3000/data");
  return await res.json();
}

export async function saveData(categorie, note) {
  await fetch("http://localhost:3000/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ categorie, note }),
  });
}
