import { createApp } from "https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js";
import pagination from "./pagination.js";
import productModal from "./productModal.js"
import delProductModal from "./delProductModal.js"

const apiUrl = "https://vue3-course-api.hexschool.io/api";
const apiPath = "yangalice212";

let proModal = null; //定義接近全域變數
let delModal = null;

const app = createApp({
  data() {
    return {
      products: [],
      isNew: false,
      tempProduct: {
        imagesUrl: [],
      },
      pagination: {},
    };
  },
  components: {
    pagination,
    productModal,
    delProductModal,
  },
  mounted() {
    //建立 Bootstrap 實體
    proModal = new bootstrap.Modal(
      document.getElementById("productModal"),
      {
        keyboard: false,
      }
    );
    delModal = new bootstrap.Modal(
      document.getElementById("delProductModal"),
      {
        keyboard: false,
      }
    );
    //驗證
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
    if (token === "") {
      alert("請重新登入");
      window.location = "login.html";
    }
    axios.defaults.headers.common.Authorization = token;
    this.getData();
  },
  methods: {
    getData(page = 1) {
      axios
        .get(`${apiUrl}/${apiPath}/admin/products?page=${page}`)
        .then((res) => {
          if (res.data.success) {
            this.products = res.data.products;
            this.pagination = res.data.pagination;
          } else {
            console.log(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    openModal(status, item) {
      if (status === "new") {
        this.tempProduct = {
          imagesUrl: [],
        };
        this.isNew = true;
        proModal.show();
      } else if (status === "edit") {
        // 避免還未按下儲存就更動到值(傳參考特行)，若沒新增一個 obj，就會改到同一個
        this.tempProduct = { ...item };
        this.isNew = false;
        proModal.show();
      } else if (status === "delete") {
        this.tempProduct = { ...item };
        delModal.show();
      }
    },
    updateProduct(tempProduct) {
      let url = `${apiUrl}/${apiPath}/admin/product`;
      let http = "post";
      if (!this.isNew) {
        url = `${apiUrl}/${apiPath}/admin/product/${tempProduct.id}`;
        http = "put";
      }
      axios[http](url, { data: tempProduct })
        .then((res) => {
          if (res.data.success) {
            alert(res.data.message);
            proModal.hide();
            this.getData();
          } else {
            alert(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    delProduct(tempProduct) {
      axios
        .delete(`${apiUrl}/${apiPath}/admin/product/${tempProduct.id}`)
        .then((res) => {
          if (res.data.success) {
            alert(res.data.message);
            delModal.hide();
            this.getData();
          } else {
            console.log(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
});

app.mount("#app");
