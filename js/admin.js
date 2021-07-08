import { createApp } from "https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js";
import pagination from "./pagination.js";
const apiUrl = "https://vue3-course-api.hexschool.io/api";
const apiPath = "yangalice212";

let productModal = null; //定義接近全域變數
let delProductModal = null;

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
  },
  mounted() {
    //建立 Bootstrap 實體
    productModal = new bootstrap.Modal(
      document.getElementById("productModal"),
      {
        keyboard: false,
      }
    );
    delProductModal = new bootstrap.Modal(
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
        productModal.show();
      } else if (status === "edit") {
        // 避免還未按下儲存就更動到值(傳參考特行)，若沒新增一個 obj，就會改到同一ㄍㄜ
        this.tempProduct = { ...item };
        this.isNew = false;
        productModal.show();
      } else if (status === "delete") {
        this.tempProduct = { ...item };
        delProductModal.show();
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
            productModal.hide();
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
            delProductModal.hide();
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
app.component("productModal", {
  props: ["tempProduct"],
  methods: {
    createImages() {
      //加上一個空陣列，讓 imagesUrl 為陣列形式
      this.tempProduct.imagesUrl = [];
      this.tempProduct.imagesUrl.push("");
    },
  },
  template: `<div id="productModal" ref="productModal" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-xl">
      <div class="modal-content border-0">
        <div class="modal-header bg-dark text-white">
          <h5 id="productModalLabel" class="modal-title">
            <span v-if="isNew">新增產品</span>
            <span v-else>編輯產品</span>
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-sm-4">
              <div class="form-group">
                <label for="imageUrl">主要圖片</label>
                <input id="imageUrl" v-model="tempProduct.imageUrl" type="text" class="form-control"
                  placeholder="請輸入圖片連結">
                <img class="img-fluid" :src="tempProduct.imageUrl">
              </div>
              <div class="mb-1">多圖新增</div>
              <!-- Array.isArray - 判斷是否為陣列 -->
              <div v-if="Array.isArray(tempProduct.imagesUrl)">
                <!-- 讓新增圖片區塊重複出現 -->
                <div class="mb-1" v-for="(image, key) in tempProduct.imagesUrl" :key="key">
                  <div class="form-group">
                    <label for="imageUrl1">圖片網址</label>
                    <input id="imageUrl1" v-model="tempProduct.imagesUrl[key]" type="text" class="form-control"
                      placeholder="請輸入圖片連結">
                  </div>
                  <img class="img-fluid" :src="image">
                </div>
                <!-- 判斷 tempProduct.imagesUrl.length 為假值，也就是 0，就不能使用下方刪除圖片功能 -->
                <!-- 當 imagesUrl 陣列最後一項有值時，也要出現新增圖片的按鈕 -->
                <div v-if="!tempProduct.imagesUrl.length || tempProduct.imagesUrl[tempProduct.imagesUrl.length - 1]">
                  <button class="btn btn-outline-primary btn-sm d-block w-100"
                    @click="tempProduct.imagesUrl.push('')">
                    <!-- 新增一個空字串進 imagesUrl 陣列中 -->
                    新增圖片
                  </button>
                </div>
                <div v-else>
                  <button class="btn btn-outline-danger btn-sm d-block w-100" @click="tempProduct.imagesUrl.pop()">
                    <!-- pop - 是將最後一個刪掉 -->
                    刪除圖片
                  </button>
                </div>
              </div>
              <div v-else>
                <button class="btn btn-outline-primary btn-sm d-block w-100" @click="createImages">
                  多圖新增
                </button>
              </div>
            </div>
            <div class="col-sm-8">
              <div class="form-group">
                <label for="title">標題</label>
                <input id="title" v-model="tempProduct.title" type="text" class="form-control" placeholder="請輸入標題">
              </div>

              <div class="row">
                <div class="form-group col-md-6">
                  <label for="category">分類</label>
                  <input id="category" v-model="tempProduct.category" type="text" class="form-control"
                    placeholder="請輸入分類">
                </div>
                <div class="form-group col-md-6">
                  <label for="unit">單位</label>
                  <input id="unit" v-model="tempProduct.unit" type="text" class="form-control" placeholder="請輸入單位">
                </div>
              </div>

              <div class="row">
                <div class="form-group col-md-6">
                  <label for="origin_price">原價</label>
                  <input id="origin_price" v-model.number="tempProduct.origin_price" type="number" min="0"
                    class="form-control" placeholder="請輸入原價">
                </div>
                <div class="form-group col-md-6">
                  <label for="price">售價</label>
                  <input id="price" v-model.number="tempProduct.price" type="number" min="0" class="form-control"
                    placeholder="請輸入售價">
                </div>
              </div>
              <hr>

              <div class="form-group">
                <label for="description">產品描述</label>
                <textarea id="description" v-model="tempProduct.description" type="text" class="form-control"
                  placeholder="請輸入產品描述">
          </textarea>
              </div>
              <div class="form-group">
                <label for="content">說明內容</label>
                <textarea id="content" v-model="tempProduct.content" type="text" class="form-control"
                  placeholder="請輸入說明內容">
          </textarea>
              </div>
              <div class="form-group">
                <div class="form-check">
                  <input id="is_enabled" v-model="tempProduct.is_enabled" class="form-check-input" type="checkbox"
                    :true-value="1" :false-value="0">
                  <label class="form-check-label" for="is_enabled">是否啟用</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
            取消
          </button>
          <button type="button" class="btn btn-primary" @click="$emit('update-product', tempProduct)">
            確認
          </button>
        </div>
      </div>
    </div>
  </div>`,
});
app.component("delProductModal", {
  props: ["tempProduct"],
  template: `<div id="delProductModal" ref="delProductModal" class="modal fade" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content border-0">
        <div class="modal-header bg-danger text-white">
          <h5 id="delProductModalLabel" class="modal-title">
            <span>刪除產品</span>
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          是否刪除
          <strong class="text-danger">{{ tempProduct.title }}</strong> 商品(刪除後將無法恢復)。
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
            取消
          </button>
          <button type="button" class="btn btn-danger" @click="$emit('del-product', tempProduct)">
            確認刪除
          </button>
        </div>
      </div>
    </div>
  </div>`,
});
app.mount("#app");
