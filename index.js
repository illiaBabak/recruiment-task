const isMobile = window.innerWidth <= 767;

const container = document.getElementsByClassName("container")[0];
const loader = document.getElementsByClassName("loader")[0];
const itemsListContainer = document.getElementsByClassName("products-list")[0];
const pageSizeSelect = document.getElementsByClassName(
  "count-products-select"
)[0];
const intersectionEl = document.getElementsByClassName(
  "intersection-element"
)[0];
const mobileMenuBtn = document.getElementsByClassName("mobile-menu")[0];
const menuWrapper = document.getElementsByClassName("menu-sections-wrapper")[0];
const menu = document.getElementsByClassName("menu-sections")[0];
const sections = document.querySelectorAll("[id]");

let pageSize = pageSizeSelect.value;
let currentPage = 1;
let isFetching = false;

const showMenu = () => menuWrapper.classList.remove("hide");

const hideMenu = () => menuWrapper.classList.add("hide");

mobileMenuBtn.addEventListener("click", () =>
  menuWrapper.classList.toggle("hide")
);

menuWrapper.addEventListener("click", () => hideMenu());

menu.addEventListener("click", (e) => e.stopPropagation());

// Reset values to prevent duplicates after select change and re-fetching
pageSizeSelect.addEventListener("change", (e) => {
  currentPage = 1;
  pageSize = e.currentTarget.value;

  observer.observe(intersectionEl);

  document.querySelectorAll(".product").forEach((product) => product.remove());
});

document.addEventListener("DOMContentLoaded", () => {
  // This adds animate on scroll page
  const elementsToAnimate = document.querySelectorAll(".hidden");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("show");
      });
    },
    { threshold: "0.1" }
  );

  elementsToAnimate.forEach((el) => observer.observe(el));

  // This adds event listeners to buttons to smoothly scroll to their respective sections.
  document.querySelectorAll(".section-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const targetId = btn.querySelector("a").getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      document
        .querySelectorAll(".section-btn")
        .forEach((sectionBtn) =>
          sectionBtn.classList.remove("current-section")
        );

      btn.classList.add("current-section");

      hideMenu();

      if (targetElement)
        targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
});

// paralax effect
document.addEventListener("DOMContentLoaded", () => {
  const composition = document.querySelector(".composition");

  const getScrolledPercentage = (element) => {
    const rect = element.getBoundingClientRect();
    const elementTop = rect.top;

    const windowHeight = window.innerHeight;

    const scrolledPercentage =
      Math.max(
        0,
        Math.min(1, (windowHeight - elementTop) / element.offsetHeight)
      ) * 100;

    return scrolledPercentage;
  };

  window.addEventListener("scroll", () => {
    const scrolledPercentage = getScrolledPercentage(composition) - 90;

    composition.style.backgroundPosition = `center calc(100% - ${scrolledPercentage}%)`;
  });
});

const toggleIds = () => {
  const elements = [
    { className: "dosage-element", id: "dosage" },
    { className: "recommendations-element", id: "recommendations" },
    { className: "actions-element", id: "actions" },
  ];

  elements.forEach(({ className, id }) => {
    const element =
      document.getElementById(id) || document.querySelector(`.${className}`);

    if (!element) return;

    if (isMobile) element.id = id;
    else element.removeAttribute("id");
  });
};

toggleIds();

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      if (!entry.target.id) return;

      document.querySelectorAll(".section-btn").forEach((btn) => {
        btn.classList.remove("current-section");
      });

      const links = document.querySelectorAll(
        `.section-btn a[href="#${entry.target.id}"]`
      );

      links.forEach((link) =>
        link.parentElement.classList.add("current-section")
      );
    }
  });
});

sections.forEach((section) => {
  sectionObserver.observe(section);
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
