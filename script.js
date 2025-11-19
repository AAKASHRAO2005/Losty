// Navigation
function showPage(pageId) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
  window.scrollTo(0, 0);
  if (pageId === "view-items") renderItems();
}

function toggleMenu() {
  const menu = document.getElementById("nav-menu");
  menu.classList.toggle("show");
}



// Handle form submission for new items
function previewImage(event, previewId) {
  const file = event.target.files[0];
  const preview = document.getElementById(previewId);

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      preview.style.display = "block"; // ensure visible
    };
    reader.readAsDataURL(file);
  } else {
    preview.style.display = "none"; // hide if nothing selected
  }
}

// Close modal
function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
}

// Save items in localStorage
function getItems() {
  return JSON.parse(localStorage.getItem("items")) || [];
}
function saveItems(items) {
  localStorage.setItem("items", JSON.stringify(items));
}

// Submit new item
function submitItem(e, status) {
  e.preventDefault();
  const id = Date.now();
  const inputs = e.target.querySelectorAll("input[type='text']");
  const name = inputs[0].value;
  const loc = inputs[1].value;
  const contact = inputs[2].value;
  const desc = e.target.querySelector("textarea").value;
  const fileInput = e.target.querySelector("input[type='file']");
  let img = "https://via.placeholder.com/300x200?text=No+Image";
  if (fileInput.files[0]) {
    img = URL.createObjectURL(fileInput.files[0]);
  }
  const newItem = {
    id,
    title: name,
    desc,
    location: loc,
    contact,
    date: new Date().toLocaleDateString(),
    status,
    image: img
  };
  const items = getItems();
  items.push(newItem);
  saveItems(items);
  e.target.reset();
  alert(status + " item submitted!");
  showPage("view-items");
}

// Render items with search/filter
function renderItems() {
  const items = getItems();
  const search = document.getElementById("searchInput").value.toLowerCase();
  const filter = document.getElementById("filterSelect").value;
  const sort = document.getElementById("sortSelect").value;
  const container = document.getElementById("itemsContainer");
  container.innerHTML = "";

  let filtered = items.filter(i =>
    (filter === "all" || i.status === filter) &&
    (i.title.toLowerCase().includes(search) || i.desc.toLowerCase().includes(search))
  );

  // Sorting
  filtered = filtered.sort((a, b) => {
    return sort === "latest" ? b.id - a.id : a.id - b.id;
  });

  if (filtered.length === 0) {
    container.innerHTML = "<p style='text-align:center;'>No items found.</p>";
    return;
  }

  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.onclick = () => showItemDetails(item.id);
    card.innerHTML = `
      <img src="${item.image}" alt="${item.title}">
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
      <p><strong>Location:</strong> ${item.location}</p>
      <p><strong>Date:</strong> ${item.date}</p>
      <p class="status ${item.status.toLowerCase()}">${item.status}</p>
    `;
    container.appendChild(card);
  });
}

// Show item details
function showItemDetails(id) {
  const item = getItems().find(i => i.id === id);
  if (item) {
    document.getElementById("itemDetails").innerHTML = `
      <div class="item-details">
        <img src="${item.image}" alt="${item.title}">
        <h2>${item.title}</h2>
        <p><strong>Description:</strong> ${item.desc}</p>
        <p><strong>Location:</strong> ${item.location}</p>
        <p><strong>Date Reported:</strong> ${item.date}</p>
        <p><strong>Status:</strong> ${item.status}</p>
        <p><strong>Contact:</strong> ${item.contact}</p>
        <div style="margin-top:15px; display:flex; gap:10px; flex-wrap:wrap;">
          <button onclick="openEditModal(${item.id})">Edit</button>
          <button onclick="deleteItem(${item.id})" style="background:#b00020;">Delete</button>
        </div>
      </div>
    `;
    showPage("item-details");
  }
}

// Delete item
function deleteItem(id) {
  if (!confirm("Are you sure you want to delete this item?")) return;
  let items = getItems().filter(i => i.id !== id);
  saveItems(items);
  alert("Item deleted.");
  showPage("view-items");
}

// Contact nav scroll
function goToContact() {
  showPage("home");
  setTimeout(() => {
    document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
  }, 100);
}

// Contact form submission
function submitContact(e) {
  e.preventDefault();
  const name = document.getElementById("cname").value;
  const email = document.getElementById("cemail").value;
  const msg = document.getElementById("cmsg").value;
  document.getElementById("contactStatus").textContent =
    `Thank you, ${name}! Your message has been received.`;
  e.target.reset();
}

// Init with dummy items if empty
if (getItems().length === 0) {
  saveItems([
    {
      id: 1,
      title: "Black Wallet",
      desc: "Slim black leather wallet containing ID cards and some cash.",
      location: "College Library",
      contact: "walletowner@mail.com",
      date: "Aug 30, 2025",
      status: "Lost",
      image: "https://m.media-amazon.com/images/I/61sdH5I8uzL._UY1100_.jpg"
    },
    {
      id: 2,
      title: "Blue Backpack",
      desc: "Medium-sized backpack with notebooks and a water bottle inside.",
      location: "Cafeteria",
      contact: "finder@mail.com",
      date: "Sep 1, 2025",
      status: "Found",
      image: "https://via.placeholder.com/500x300?text=Blue+Backpack"
    }
  ]);
}

// ---- Edit Modal ----
function openEditModal(itemId) {
  const item = getItems().find(i => i.id === itemId);
  if (!item) return;
  document.getElementById("editId").value = item.id;
  document.getElementById("editName").value = item.title;
  document.getElementById("editDesc").value = item.desc;
  document.getElementById("editLoc").value = item.location;
  document.getElementById("editContact").value = item.contact;
  document.getElementById("editPreview").src = item.image;
  document.getElementById("editPreview").style.display = "block";
  document.getElementById("editModal").style.display = "flex";
}
function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
}
function saveEdit(e) {
  e.preventDefault();
  const id = parseInt(document.getElementById("editId").value);
  const items = getItems();
  const item = items.find(i => i.id === id);
  if (!item) return;
  item.title = document.getElementById("editName").value;
  item.desc = document.getElementById("editDesc").value;
  item.location = document.getElementById("editLoc").value;
  item.contact = document.getElementById("editContact").value;
  const fileInput = document.getElementById("editUpload");
  if (fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = () => {
      item.image = reader.result;
      saveItems(items);
      closeEditModal();
      showItemDetails(id);
      renderItems();
    };
    reader.readAsDataURL(fileInput.files[0]);
    return;
  }
  saveItems(items);
  closeEditModal();
  showItemDetails(id);
  renderItems(); 
}
// Close modal on outside click
window.onclick = function(event) {
  const modal = document.getElementById("editModal");
  if (event.target === modal) {
    closeEditModal();
  }
};


renderItems();
showPage("home");