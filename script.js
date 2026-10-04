const STORAGE_KEY = "obra-clara-rentals-v1";
const currency = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
const dateFormatter = new Intl.DateTimeFormat("es-EC", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const products = {
  scaffold: {
    label: "Andamios",
    unit: "pares",
    priceLabel: "Precio acordado por par / día",
    referencePrice: 1.25,
    calculation: "time",
    stock: "scaffoldPairs",
  },
  "wall-metal": {
    label: "Encofrado metálico",
    unit: "m²",
    priceLabel: "Precio acordado por m²",
    referencePrice: 2.5,
    calculation: "area",
    stock: "metalBoards",
  },
  "wall-wood": {
    label: "Encofrado de madera",
    unit: "m²",
    priceLabel: "Precio acordado por m²",
    referencePrice: 2,
    calculation: "area",
    stock: "woodBoards",
  },
  columns: {
    label: "Encofrado de columnas",
    unit: "columnas",
    priceLabel: "Precio acordado por columna",
    referencePrice: 8,
    calculation: "columns",
    stock: "columnPanels",
  },
};

const inventory = [
  { key: "scaffoldPairs", label: "Pares de andamio", unit: "pares", total: 50, maintenance: 2 },
  { key: "metalBoards", label: "Tableros metálicos", unit: "tableros", total: 100, maintenance: 5 },
  { key: "woodBoards", label: "Tableros de madera", unit: "tableros", total: 80, maintenance: 4 },
  { key: "columnPanels", label: "Planchas para columnas", unit: "planchas", total: 48, maintenance: 3 },
  { key: "joists", label: "Viguetas", unit: "unidades", total: 100, maintenance: 6 },
  { key: "props", label: "Puntales", unit: "unidades", total: 120, maintenance: 8 },
];

function dateOffset(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return toDateInputValue(date);
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const demoRentals = [
  {
    id: "ALQ-024",
    client: "Constructora Valle",
    type: "scaffold",
    quantity: 12,
    price: 1.25,
    duration: 7,
    durationUnit: "day",
    total: 105,
    paid: 60,
    dueDate: dateOffset(4),
    status: "active",
    materialsUse: { scaffoldPairs: 12 },
  },
  {
    id: "ALQ-023",
    client: "Andrea López",
    type: "wall-metal",
    quantity: 32,
    price: 2.5,
    total: 80,
    paid: 80,
    dueDate: dateOffset(2),
    status: "active",
    materialsUse: { metalBoards: 44, joists: 12, props: 18 },
  },
  {
    id: "ALQ-022",
    client: "Luis Paredes",
    type: "scaffold",
    quantity: 5,
    price: 1.5,
    duration: 7,
    durationUnit: "day",
    total: 52.5,
    paid: 20,
    dueDate: dateOffset(-2),
    status: "active",
    materialsUse: { scaffoldPairs: 5 },
  },
  {
    id: "ALQ-021",
    client: "Obras del Norte",
    type: "columns",
    quantity: 4,
    price: 8,
    total: 32,
    paid: 0,
    dueDate: "",
    status: "quote",
    materialsUse: { columnPanels: 16 },
  },
];

const rentalRows = document.querySelector("#rental-rows");
const searchInput = document.querySelector("#rental-search");
const statusFilter = document.querySelector("#status-filter");
const emptyRentals = document.querySelector("#empty-rentals");
const inventoryGrid = document.querySelector("#inventory-grid");
const dialog = document.querySelector("#rental-dialog");
const form = document.querySelector("#rental-form");
const toast = document.querySelector("#toast");
const notice = document.querySelector("#storage-notice");
const formFeedback = document.querySelector("#form-feedback");
const pwaStatus = document.querySelector("#pwa-status");
const installButton = document.querySelector("#install-app");
let rentals = loadRentals();
let toastTimer;
let installPromptEvent = null;
let serviceWorkerReady = false;

document.querySelector("#today-date").textContent = new Intl.DateTimeFormat("es-EC", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

function loadRentals() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) {
      return demoRentals;
    }

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      throw new TypeError("El contenido guardado no tiene el formato esperado.");
    }
    return parsed;
  } catch (error) {
    console.error("No se pudieron leer los alquileres guardados.", error);
    notice.textContent =
      "No se pudieron leer los datos locales. Se muestran registros de ejemplo; comprueba el almacenamiento de este navegador.";
    return demoRentals;
  }
}

function saveRentals(nextRentals) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRentals));
    notice.textContent =
      "Información ilustrativa. Los registros nuevos se guardan únicamente en el almacenamiento local de este navegador.";
    return true;
  } catch (error) {
    console.error("No se pudo guardar el alquiler en este navegador.", error);
    notice.textContent =
      "No se pudo guardar el registro en este navegador. Libera espacio o habilita el almacenamiento local e inténtalo de nuevo.";
    return false;
  }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function getStatus(rental) {
  if (
    rental.status === "active" &&
    rental.dueDate &&
    rental.dueDate < toDateInputValue(new Date())
  ) {
    return "late";
  }
  return rental.status;
}

function statusLabel(status) {
  const labels = {
    reserved: "Reservado",
    active: "Entregado",
    late: "Atrasado",
    quote: "Cotización",
    returned: "Devuelto",
  };
  return labels[status] || "Sin estado";
}

function formatDate(value) {
  if (!value) {
    return "Sin fecha definida";
  }
  const [year, month, day] = value.split("-").map(Number);
  return dateFormatter.format(new Date(year, month - 1, day));
}

function formatMoney(value) {
  return currency.format(value);
}

function rentalDescription(rental) {
  if (rental.type === "scaffold") {
    const timing = rental.duration
      ? `${rental.duration} ${rental.durationUnit === "day" ? "días" : rental.durationUnit === "week" ? "semanas" : "meses"}`
      : "plazo abierto";
    return `${rental.quantity} pares · ${timing}`;
  }
  if (rental.type === "columns") {
    const panels = rental.materialsUse?.columnPanels || 0;
    return `${rental.quantity} columnas · ${panels} planchas`;
  }
  const panels =
    rental.materialsUse?.[rental.type === "wall-metal" ? "metalBoards" : "woodBoards"] || 0;
  return `${rental.quantity} m² · ${panels} tableros`;
}

function balanceFor(rental) {
  if (rental.total === null || rental.total === undefined) {
    return null;
  }
  return Math.max(0, Number(rental.total) - Number(rental.paid || 0));
}

function renderRentals() {
  const searchTerm = searchInput.value.trim().toLocaleLowerCase("es");
  const selectedStatus = statusFilter.value;
  const visibleRentals = rentals.filter((rental) => {
    const matchesSearch =
      `${rental.id} ${rental.client} ${products[rental.type]?.label || ""}`
        .toLocaleLowerCase("es")
        .includes(searchTerm);
    const matchesStatus =
      selectedStatus === "all" || getStatus(rental) === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  rentalRows.innerHTML = visibleRentals
    .map((rental) => {
      const status = getStatus(rental);
      const balance = balanceFor(rental);
      const name = products[rental.type]?.label || "Equipo";
      return `
        <tr>
          <td><strong>${escapeHTML(rental.id)}</strong><small>${escapeHTML(rental.client)}</small></td>
          <td><strong>${escapeHTML(name)}</strong><small>${escapeHTML(rentalDescription(rental))}</small></td>
          <td>${escapeHTML(formatDate(rental.dueDate))}</td>
          <td><span class="status-badge status-${escapeHTML(status)}">${escapeHTML(statusLabel(status))}</span></td>
          <td class="${balance ? "balance-positive" : "balance-zero"}">${balance === null ? "Por liquidar" : escapeHTML(formatMoney(balance))}</td>
        </tr>
      `;
    })
    .join("");

  emptyRentals.hidden = visibleRentals.length > 0;
  updateMetrics();
  renderInventory();
}

function getReservedQuantity(stockKey) {
  return rentals.reduce((sum, rental) => {
    const status = getStatus(rental);
    if (!["reserved", "active", "late"].includes(status)) {
      return sum;
    }
    return sum + Number(rental.materialsUse?.[stockKey] || 0);
  }, 0);
}

function updateMetrics() {
  const ongoing = rentals.filter((rental) =>
    ["reserved", "active", "late"].includes(getStatus(rental)),
  );
  const late = ongoing.filter((rental) => getStatus(rental) === "late").length;
  const committed = inventory.reduce(
    (sum, item) => sum + getReservedQuantity(item.key),
    0,
  );
  const usable = inventory.reduce(
    (sum, item) => sum + item.total - item.maintenance,
    0,
  );
  const balance = ongoing.reduce((sum, rental) => sum + (balanceFor(rental) || 0), 0);

  document.querySelector("#metric-active").textContent = String(ongoing.length);
  document.querySelector("#metric-late").textContent = String(late);
  document.querySelector("#metric-occupancy").textContent = String(
    usable === 0 ? 0 : Math.round((committed / usable) * 100),
  );
  document.querySelector("#metric-balance").textContent = formatMoney(balance);
}

function renderInventory() {
  inventoryGrid.innerHTML = inventory
    .map((item) => {
      const reserved = getReservedQuantity(item.key);
      const usable = item.total - item.maintenance;
      const available = Math.max(0, usable - reserved);
      const percentage = usable === 0 ? 0 : Math.min(100, (available / usable) * 100);
      return `
        <article class="inventory-card">
          <div class="inventory-card-top">
            <div><h3>${escapeHTML(item.label)}</h3><p>${item.total} en inventario · ${item.maintenance} en mantenimiento</p></div>
            <strong class="inventory-available">${available}<small>${escapeHTML(item.unit)}</small></strong>
          </div>
          <div class="inventory-track" role="img" aria-label="${available} ${escapeHTML(item.unit)} disponibles de ${usable} utilizables"><span style="width: ${percentage}%"></span></div>
          <p class="inventory-breakdown">${reserved} comprometidos · ${usable} utilizables</p>
        </article>
      `;
    })
    .join("");
}

const rentalType = document.querySelector("#rental-type");
const quantityInput = document.querySelector("#rental-quantity");
const quantityLabel = document.querySelector("#quantity-label");
const durationField = document.querySelector("#duration-field");
const durationLabel = document.querySelector("#duration-label");
const durationInput = document.querySelector("#duration-quantity");
const durationUnit = document.querySelector("#duration-unit");
const priceInput = document.querySelector("#agreed-price");
const priceLabel = document.querySelector("#price-label");
const referencePrice = document.querySelector("#reference-price");
const panelsField = document.querySelector("#panels-field");
const panelsLabel = document.querySelector("#panels-label");
const panelsInput = document.querySelector("#panels-quantity");
const openRentalField = document.querySelector("#open-rental-field");
const joistsField = document.querySelector("#joists-field");
const joistsInput = document.querySelector("#joists-quantity");
const propsField = document.querySelector("#props-field");
const propsInput = document.querySelector("#props-quantity");
const openRental = document.querySelector("#open-rental");
const dueDateInput = document.querySelector("#due-date");
const transportInput = document.querySelector("#transport-cost");
const depositInput = document.querySelector("#deposit-amount");
const paymentInput = document.querySelector("#initial-payment");
const calculationTotal = document.querySelector("#calculation-total");
const calculationDetail = document.querySelector("#calculation-detail");

function updateProductFields(resetPrice = false) {
  const product = products[rentalType.value];
  const isScaffold = product.calculation === "time";
  const isWall = product.calculation === "area";
  const isColumns = product.calculation === "columns";
  if (!isScaffold) {
    openRental.checked = false;
  }

  quantityLabel.textContent =
    isScaffold ? "Cantidad de pares" : isWall ? "Superficie acordada (m²)" : "Cantidad de columnas";
  quantityInput.min = isWall ? "0.1" : "1";
  quantityInput.step = isWall ? "0.1" : "1";
  if (resetPrice) {
    quantityInput.value = isWall ? "10" : "1";
    priceInput.value = product.referencePrice.toFixed(2);
    panelsInput.value = isColumns ? "4" : isWall ? "14" : "0";
    joistsInput.value = isWall ? "0" : "0";
    propsInput.value = "0";
  }

  durationField.hidden = !isScaffold;
  durationInput.disabled = !isScaffold || openRental.checked;
  durationInput.hidden = isScaffold && openRental.checked;
  durationInput.required = isScaffold && !openRental.checked;
  durationLabel.textContent = openRental.checked ? "Tarifa por período" : "Tiempo acordado";
  openRentalField.hidden = !isScaffold;
  panelsField.hidden = !(isWall || isColumns);
  panelsInput.required = isWall || isColumns;
  panelsInput.min = isWall || isColumns ? "1" : "0";
  joistsField.hidden = !isWall;
  propsField.hidden = !isWall;
  joistsInput.required = isWall;
  propsInput.required = isWall;
  const periodNames = { day: "día", week: "semana", month: "mes" };
  priceLabel.textContent =
    isScaffold
      ? `Precio acordado por par / ${periodNames[durationUnit.value]}`
      : product.priceLabel;
  referencePrice.textContent = `Valor de muestra editable: ${formatMoney(product.referencePrice)}`;
  panelsLabel.textContent = isColumns ? "Planchas a reservar" : "Tableros a reservar";
  updateCalculation();
}

function buildMaterialUse(type, quantity) {
  if (type === "scaffold") {
    return { scaffoldPairs: quantity };
  }
  if (type === "columns") {
    return { columnPanels: Number(panelsInput.value) };
  }
  return {
    [type === "wall-metal" ? "metalBoards" : "woodBoards"]: Number(panelsInput.value),
    joists: Number(joistsInput.value),
    props: Number(propsInput.value),
  };
}

function calculateRentalTotal(type, quantity, price, duration) {
  const product = products[type];
  const subtotal =
    product.calculation === "time"
      ? quantity * price * duration
      : quantity * price;
  return subtotal + Number(transportInput.value || 0);
}

function updateCalculation() {
  const type = rentalType.value;
  const product = products[type];
  const quantity = Number(quantityInput.value);
  const price = Number(priceInput.value);
  const transport = Number(transportInput.value || 0);

  if (!product || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(price)) {
    calculationTotal.textContent = "—";
    calculationDetail.textContent = "Ingresa cantidades y precios válidos para ver el cálculo.";
    return;
  }

  if (openRental.checked && product.calculation === "time") {
    const periodNames = { day: "día", week: "semana", month: "mes" };
    calculationTotal.textContent = `${formatMoney(price)} / ${periodNames[durationUnit.value]}`;
    calculationDetail.textContent =
      `Alquiler abierto: la tarifa se conserva por ${periodNames[durationUnit.value]} y el total se liquida al definir el tiempo. El transporte y la garantía se registran aparte.`;
    return;
  }

  const duration = product.calculation === "time" ? Number(durationInput.value) : 1;
  if (product.calculation === "time" && (!Number.isFinite(duration) || duration < 1)) {
    calculationTotal.textContent = "—";
    calculationDetail.textContent = "Ingresa un tiempo de alquiler válido.";
    return;
  }

  const subtotal =
    product.calculation === "time" ? quantity * price * duration : quantity * price;
  const total = calculateRentalTotal(type, quantity, price, duration);
  const timing =
    product.calculation === "time"
      ? ` · ${duration} ${durationUnit.options[durationUnit.selectedIndex].text}`
      : "";
  const unitSummary =
    product.calculation === "time"
      ? `${quantity} pares × ${formatMoney(price)}${timing}`
      : `${quantity} ${product.unit} × ${formatMoney(price)}`;

  calculationTotal.textContent = formatMoney(total);
  calculationDetail.textContent = `${unitSummary} + ${formatMoney(transport)} de transporte. Garantía (${formatMoney(Number(depositInput.value || 0))}) y abono inicial (${formatMoney(Number(paymentInput.value || 0))}) se registran aparte del cálculo.`;
  if (subtotal === 0) {
    calculationDetail.textContent = "El total puede ser cero si así se acordó; confirma el precio antes de guardar.";
  }
}

function getInventoryAvailability(stockKey) {
  const item = inventory.find((entry) => entry.key === stockKey);
  if (!item) {
    return 0;
  }
  return Math.max(0, item.total - item.maintenance - getReservedQuantity(stockKey));
}

function validateInventory(materialsUse) {
  for (const [stockKey, requested] of Object.entries(materialsUse)) {
    const item = inventory.find((entry) => entry.key === stockKey);
    if (!item || requested <= 0) {
      continue;
    }
    const available = getInventoryAvailability(stockKey);
    if (requested > available) {
      return `No hay suficientes ${item.label.toLocaleLowerCase("es")}: solicitas ${requested} y hay ${available} disponibles.`;
    }
  }
  return "";
}

function nextRentalId() {
  const latestNumber = rentals.reduce((maximum, rental) => {
    const match = String(rental.id).match(/(\d+)$/);
    return match ? Math.max(maximum, Number(match[1])) : maximum;
  }, 0);
  return `ALQ-${String(latestNumber + 1).padStart(3, "0")}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3600);
}

function openRentalDialog() {
  form.reset();
  formFeedback.textContent = "";
  updateProductFields(true);
  dialog.showModal();
  document.querySelector("#client-name").focus();
}

document.querySelectorAll("[data-open-rental]").forEach((button) => {
  button.addEventListener("click", openRentalDialog);
});

document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => dialog.close());
});

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    dialog.close();
  }
});

form.addEventListener("input", updateCalculation);
form.addEventListener("change", updateCalculation);
rentalType.addEventListener("change", () => updateProductFields(true));
openRental.addEventListener("change", () => updateProductFields());
durationUnit.addEventListener("change", () => updateProductFields());

form.addEventListener("submit", (event) => {
  event.preventDefault();
  formFeedback.textContent = "";

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const client = document.querySelector("#client-name").value.trim();
  const type = rentalType.value;
  const quantity = Number(quantityInput.value);
  const price = Number(priceInput.value);
  const duration =
    products[type].calculation === "time" && !openRental.checked
      ? Number(durationInput.value)
      : null;
  const transport = Number(transportInput.value || 0);
  const deposit = Number(depositInput.value || 0);
  const paid = Number(paymentInput.value || 0);
  const isOpen = openRental.checked && products[type].calculation === "time";
  const dueDate = isOpen ? "" : dueDateInput.value;

  if (!client) {
    formFeedback.textContent = "Escribe el nombre del cliente.";
    document.querySelector("#client-name").focus();
    return;
  }
  if (dueDate && dueDate < toDateInputValue(new Date())) {
    formFeedback.textContent = "La fecha estimada de devolución no puede estar en el pasado.";
    dueDateInput.focus();
    return;
  }

  const materialsUse = buildMaterialUse(type, quantity);
  const inventoryError = validateInventory(materialsUse);
  if (inventoryError) {
    formFeedback.textContent = inventoryError;
    return;
  }

  const total = isOpen ? null : calculateRentalTotal(type, quantity, price, duration || 1);
  if (total !== null && paid > total) {
    formFeedback.textContent =
      "El abono inicial no puede superar el total calculado. La garantía se registra por separado.";
    paymentInput.focus();
    return;
  }

  const nextRental = {
    id: nextRentalId(),
    client,
    type,
    quantity,
    price,
    duration,
    durationUnit: duration ? durationUnit.value : null,
    total,
    paid,
    deposit,
    transport,
    dueDate,
    status: "reserved",
    createdAt: new Date().toISOString(),
    materialsUse,
  };
  const nextRentals = [nextRental, ...rentals];
  if (!saveRentals(nextRentals)) {
    formFeedback.textContent =
      "El registro no se guardó. Revisa el mensaje de almacenamiento local e inténtalo otra vez.";
    return;
  }

  rentals = nextRentals;
  renderRentals();
  dialog.close();
  showToast(`${nextRental.id} quedó reservado. El precio acordado se guardó en este navegador.`);
  document.querySelector("#alquileres").scrollIntoView({ behavior: "smooth" });
});

searchInput.addEventListener("input", renderRentals);
statusFilter.addEventListener("change", renderRentals);

function isInstalledApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function updateConnectionStatus() {
  if (!navigator.onLine) {
    pwaStatus.textContent =
      "Sin conexión · la aplicación está disponible; los cambios se guardan en este dispositivo.";
    pwaStatus.dataset.state = "offline";
    return;
  }

  pwaStatus.textContent = isInstalledApp()
    ? "Aplicación instalada · conectado"
    : "Conectado · los datos se guardan en este navegador";
  pwaStatus.dataset.state = "online";
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  installPromptEvent = event;
});

window.addEventListener("appinstalled", () => {
  installPromptEvent = null;
  pwaStatus.textContent = "Aplicación instalada correctamente.";
  pwaStatus.dataset.state = "installed";
  showToast("Obra Clara quedó instalada en este dispositivo.");
});

installButton.addEventListener("click", async () => {
  if (isInstalledApp()) {
    showToast("Obra Clara ya está instalada en este dispositivo.");
    return;
  }

  if (installPromptEvent) {
    installPromptEvent.prompt();
    const choice = await installPromptEvent.userChoice;
    installPromptEvent = null;
    if (choice.outcome === "accepted") {
      pwaStatus.textContent = "Instalación aceptada. Sigue las indicaciones del navegador.";
    } else {
      pwaStatus.textContent = "Instalación cancelada; puedes intentarlo más tarde.";
    }
    return;
  }

  if (!("serviceWorker" in navigator) || !window.isSecureContext) {
    showToast(
      "Para instalarla y usarla sin conexión, ábrela desde localhost o publícala con HTTPS.",
    );
    return;
  }

  if (!serviceWorkerReady) {
    showToast("La aplicación aún está preparando el modo instalable. Comprueba la conexión e inténtalo de nuevo.");
    return;
  }

  showToast(
    "Abre el menú del navegador y elige “Instalar aplicación” o “Añadir a pantalla de inicio”.",
  );
});

window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);

if ("serviceWorker" in navigator && window.isSecureContext) {
  navigator.serviceWorker
    .register("./service-worker.js", { scope: "./" })
    .then(async () => {
      await navigator.serviceWorker.ready;
      serviceWorkerReady = true;
      updateConnectionStatus();
    })
    .catch((error) => {
      console.error("No se pudo registrar el service worker.", error);
      pwaStatus.textContent =
        "No se pudo activar el modo sin conexión. Comprueba que la aplicación se sirve desde localhost o HTTPS.";
      pwaStatus.dataset.state = "error";
    });
} else {
  pwaStatus.textContent =
    "Para activar la instalación y el uso sin conexión, abre esta página desde localhost o HTTPS.";
  pwaStatus.dataset.state = "unavailable";
}

updateProductFields();
renderRentals();
