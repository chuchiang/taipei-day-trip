
//listbar 生成
document.addEventListener("DOMContentLoaded", function () {
    fetch(`/api/mrts`)
        .then(response => response.json())
        .then(data => {

            data.data.forEach(attraction => {
                // 創建<li>元素（MRT）
                let mrtListItem = document.createElement('li');
                mrtListItem.classList.add('content_listbar_mrt_name');
                mrtListItem.textContent = attraction;
                // 將捷運站名稱作為 data-mrt 屬性添加到 <li> 元素
                mrtListItem.setAttribute('data_mrt', attraction);

                // 將最終創建的元素添加到文檔中
                let mrtListContainer = document.getElementById('mrt_list'); // 替換成你想要添加的父容器的ID
                mrtListContainer.appendChild(mrtListItem);

            });
        })
        .catch(error => console.error('錯誤：', error));
});
//mrt移動
let mrtList = document.getElementById("mrt_list");
let arrowLeft = document.getElementById("arrow_left");
let arrowRight = document.getElementById("arrow_right");
let mrtName = document.querySelectorAll("content_listbar_mrt_name");
let currentPosition = 0;
let currentIndex = 0;

arrowRight.addEventListener("click", () => {
    currentPosition += 110;
    updateSlider();
});

arrowLeft.addEventListener("click", () => {
    currentPosition -= 110
    updateSlider();
});

//限制li移動
function updateSlider() {
    currentPosition = Math.max(currentPosition, 0);
    currentPosition = Math.min(currentPosition, mrtList.scrollWidth - mrtList.clientWidth);
    mrtList.style.transform = `translateX(-${currentPosition}px)`;
}


// 載入每頁的景點
let nextPage = 0; // 初始頁數
let keywordNextPage= 0;
let isLoading = false; // 是否正在載入中


// 創建IntersectionObserver實例
let intersectionObserver = new IntersectionObserver(entries => {
    // 如果正在載入中或者已經沒有下一頁，則不執行載入
    
    if (isLoading || (nextPage === null || keywordNextPage === null)) {
        return;
    }
    // 檢查每個觀察目標的進入狀態
    entries.forEach(entry => {
        
        if (entry.isIntersecting) {

            let keyword = document.getElementById('keyword').value;

            // 載入下一頁的資料
            if (keyword === ""){
                loadNextPage();
            }else{
                searchAttractions();
            }
            
        }
    });
}, { threshold: 0.5 }); // 定義觸發閾值

// 將觀察目標綁定到某個元素（例如，頁面底部的一個元素）
let targetElement = document.getElementById('judge_footer'); // 替換為你的觸發元素
intersectionObserver.observe(targetElement);

// 載入下一頁的資料
function loadNextPage() {
    // 設置為正在載入中，防止重複載入
    if (isLoading) {
        return;
    }
    isLoading = true;
    
    fetch(`/api/attractions?page=${nextPage}`)
        .then(response => response.json())
        .then(data => {
            let dataLength = data.data.length;
            if (dataLength > 0) {
                // 處理從API返回的資料
                data.data.forEach(attraction => {
                    // 創建外層<div>元素
                    let attractionItem = document.createElement('div');
                    attractionItem.classList.add('content_list_att');
                    attractionItem.id = attraction.id;

                    // 設定onclick事件
                    attractionItem.onclick = function () {
                        window.location.href = '/attraction/' + attraction.id;
                    };

                    // 創建包含圖片和名稱的<div>元素
                    let imageContainer = document.createElement('div');
                    imageContainer.classList.add('content_list_att_img');

                    // 創建圖片<img>元素
                    let image = document.createElement('img');
                    image.src = attraction.images[0];
                    image.alt = 'picture';

                    // 創建名稱<span>元素
                    let nameSpan = document.createElement('span');
                    nameSpan.classList.add('content_list_att_name');
                    nameSpan.textContent = attraction.name;

                    // 創建包含其他信息的<ul>元素
                    let infoList = document.createElement('ul');
                    infoList.classList.add('content_list_att_con');

                    // 創建<li>元素（MRT）
                    let mrtListItem = document.createElement('li');
                    mrtListItem.classList.add('content_list_att_con_mrt');
                    mrtListItem.textContent = attraction.mrt;

                    // 創建<li>元素（類別）
                    let categoryListItem = document.createElement('li');
                    categoryListItem.classList.add('content_list_att_con_catrgory');
                    categoryListItem.textContent = attraction.category;

                    // 將子元素添加到適當的父元素中
                    imageContainer.appendChild(image);
                    imageContainer.appendChild(nameSpan);
                    infoList.appendChild(mrtListItem);
                    infoList.appendChild(categoryListItem);
                    attractionItem.appendChild(imageContainer);
                    attractionItem.appendChild(infoList);

                    // 將最終創建的元素添加到文檔中
                    let attractionListContainer = document.getElementById('content_list'); // 替換成你想要添加的父容器的ID
                    attractionListContainer.appendChild(attractionItem);
                });
                // 更新下一頁的頁數
                nextPage = data.nextPage; // 假設API回傳了下一頁的頁數，如果沒有則設為null
            } else {
                // 如果API返回的資料為空，表示已經沒有下一頁了
                nextPage = null;
            }
        })
        .catch(error => console.error('錯誤：', error))
        .finally(() => {
            isLoading = false;
        });
}

let lastKeyword="";

//請求keywordksearchAttractions
async function searchAttractions() {
    let attractionList = document.getElementById('content_list');
    let keyword = document.getElementById('keyword').value;
    
    // 設置為正在載入中，防止重複載入
    if (isLoading) {
        return;
    }
    isLoading = true;   

    // 使用fetch()向API發送請求
    try {
        if (keyword !== lastKeyword) {
            // 如果关键词改变，将 keywordNextPage 重新设置为 0
            keywordNextPage = 0;
            attractionList.innerHTML = '';
            lastKeyword = keyword; // 更新最后一次使用的关键词
        }
        
        let response = await fetch(`/api/attractions?page=${keywordNextPage}&keyword=${keyword}`);
        
        let dataList = await response.json();
        let data = dataList.data;
        // 清空景點列表
        
        
        if (data !== undefined && data.length > 0) {
            // 顯示搜尋結果
            data.forEach(attraction => {
                // 創建外層<div>元素
                let attractionItem = document.createElement('div');
                attractionItem.classList.add('content_list_att');
                attractionItem.id = attraction.id;

                // 設定onclick事件
                attractionItem.onclick = function () {
                    window.location.href = '/attraction/' + attraction.id;
                };

                // 創建包含圖片和名稱的<div>元素
                let imageContainer = document.createElement('div');
                imageContainer.classList.add('content_list_att_img');

                // 創建圖片<img>元素
                let image = document.createElement('img');
                image.src = attraction.images[0];
                image.alt = 'picture';

                // 創建名稱<span>元素
                let nameSpan = document.createElement('span');
                nameSpan.classList.add('content_list_att_name');
                nameSpan.textContent = attraction.name;

                // 創建包含其他信息的<ul>元素
                let infoList = document.createElement('ul');
                infoList.classList.add('content_list_att_con');

                // 創建<li>元素（MRT）
                let mrtListItem = document.createElement('li');
                mrtListItem.classList.add('content_list_att_con_mrt');
                mrtListItem.textContent = attraction.mrt;

                // 創建<li>元素（類別）
                let categoryListItem = document.createElement('li');
                categoryListItem.classList.add('content_list_att_con_catrgory');
                categoryListItem.textContent = attraction.category;

                // 將子元素添加到適當的父元素中
                imageContainer.appendChild(image);
                imageContainer.appendChild(nameSpan);
                infoList.appendChild(mrtListItem);
                infoList.appendChild(categoryListItem);
                attractionItem.appendChild(imageContainer);
                attractionItem.appendChild(infoList);

                // 將最終創建的元素添加到文檔中
                let attractionListContainer = document.getElementById('content_list'); // 替換成你想要添加的父容器的ID
                attractionListContainer.appendChild(attractionItem);
            });
            keywordNextPage = dataList.nextPage;
            
            
        } else {
            // 顯示沒有結果
            attractionList.textContent = '沒有搜尋到任何景點';
            keywordNextPage = null;
            
        }
    } catch (error) {
        console.error('搜尋景點時出錯：', error);
    }finally{
         isLoading = false;
       
     }
}

//mrt 點選後尋關鍵字
//監聽 li 點擊事件
let keywordInput = document.getElementById('keyword');
mrtList.addEventListener('click', (event) => {
    if (event.target && event.target.tagName === 'LI') {
        let mrtName = event.target.getAttribute('data_mrt');
        keywordInput.value = mrtName; // 填入捷運站名稱到搜尋框
        let attractionList = document.getElementById('content_list');
        keywordNextPage= 0;
        attractionList.innerHTML = '';
        searchAttractions(); // 呼叫搜尋景點函數
        
    }
});

function clean(){
    let attractionList = document.getElementById('content_list');
    keywordNextPage= 0;
    attractionList.innerHTML = '';
    searchAttractions(); // 呼叫搜尋景點函數

}