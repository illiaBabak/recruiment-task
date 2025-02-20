const container = document.getElementsByClassName("container")[0];
const loader = document.getElementsByClassName("loader")[0];
const itemsListContainer = document.getElementsByClassName("products-list")[0];
const pageSizeSelect = document.getElementsByClassName(
  "count-products-select"
)[0];
const intersectionEl = document.getElementsByClassName(
  "intersection-element"
)[0];

let pageSize = pageSizeSelect.value;
let currentPage = 1;
let isFetching = false;

pageSizeSelect.addEventListener("change", (e) => {
  currentPage = 1;
  pageSize = e.currentTarget.value;

  document.querySelectorAll(".product").forEach((item) => item.remove()); //
});

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".section-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const targetId = btn.querySelector("a").getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement)
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
});

const hideModal = () => {
  document.getElementsByClassName("modal-wrapper")[0].remove();
};

const showModal = (productId, productName) => {
  const modalWrapper = document.createElement("div");
  modalWrapper.classList.add("modal-wrapper");

  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.addEventListener("click", (e) => e.stopPropagation());

  const closeBtn = document.createElement("div");
  closeBtn.classList.add("close-btn");
  closeBtn.textContent = "x";
  closeBtn.addEventListener("click", hideModal);
  modal.appendChild(closeBtn);

  const label = document.createElement("p");
  label.textContent = "ID";
  label.classList.add("modal-label");
  modal.appendChild(label);

  const modalName = document.createElement("p");
  modalName.textContent = `Nazwa: ${productId}`;
  modal.appendChild(modalName);

  const modalText = document.createElement("p");
  modalText.textContent = `Wartość: ${productName}`;
  modal.appendChild(modalText);

  modalWrapper.appendChild(modal);
  modalWrapper.addEventListener("click", hideModal);

  container.appendChild(modalWrapper);
};

const showLoader = () => (loader.style.display = "block");
const hideLoader = () => (loader.style.display = "none");

const getDataUrl = (pageNumber, pageSize) =>
  `https://brandstestowy.smallhost.pl/api/random?pageNumber=${pageNumber}&pageSize=${pageSize}`;

const fetchData = async (pageNumber, pageSize) => {
  const url = getDataUrl(pageNumber, pageSize);

  try {
    const response = await fetch(url);

    if (!response.ok) throw new Error("Failed to fetch data");

    return await response.json();
  } catch (error) {
    console.error(`An error occurred while fetching data: ${error.message}`);
  }
};

const loadItems = async () => {
  if (isFetching) return;

  isFetching = true;
  showLoader();

  const newData = await fetchData(currentPage, pageSize);

  if (!newData?.data?.length) {
    hideLoader();
    return;
  }

  if (newData.totalPages === currentPage) observer.unobserve(intersectionEl);

  newData.data.forEach((product) => {
    const productItem = document.createElement("div");
    productItem.className = "product";
    productItem.textContent = `ID: ${product.id}`;
    productItem.addEventListener("click", () =>
      showModal(product.id, product.text)
    );
    itemsListContainer.appendChild(productItem);
  });

  currentPage++;
  isFetching = false;
  hideLoader();
};

const observer = new IntersectionObserver(
  (entries) => {
    const lastItem = entries[0];

    if (lastItem.isIntersecting) loadItems();
  },
  { rootMargin: "150px" }
);

observer.observe(intersectionEl);
