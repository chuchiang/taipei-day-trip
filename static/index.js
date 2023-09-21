
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
    console.log("aftermove:" + currentPosition)
    mrtList.style.transform = `translateX(-${currentPosition}px)`;
}


// 載入每頁的景點
let nextPage = 0; // 初始頁數
let isLoading = false; // 是否正在載入中
// 創建IntersectionObserver實例
let intersectionObserver = new IntersectionObserver(entries => {
    // 如果正在載入中或者已經沒有下一頁，則不執行載入
    if (isLoading || nextPage === null) {
        return;
    }
    // 檢查每個觀察目標的進入狀態
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // 載入下一頁的資料
            loadNextPage();
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



//請求keyword
async function searchAttractions() {
    let keyword = document.getElementById('keyword').value;
    let attractionList = document.getElementById('content_list');

    // 使用fetch()向API發送請求
    try {
        let response = await fetch(`/api/attractions?keyword=${keyword}`);
        let dataList = await response.json();
        let data = dataList.data;
        nextPage = null;
        // 清空景點列表
        attractionList.innerHTML = '';

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
        } else {
            // 顯示沒有結果
            attractionList.textContent = '沒有搜尋到任何景點';
            nextPage = null;
        }
    } catch (error) {
        console.error('搜尋景點時出錯：', error);
    }
}


//mrt 點選後尋關鍵字
//監聽 li 點擊事件
let keywordInput = document.getElementById('keyword');
mrtList.addEventListener('click', (event) => {
    if (event.target && event.target.tagName === 'LI') {
        let mrtName = event.target.getAttribute('data_mrt');
        keywordInput.value = mrtName; // 填入捷運站名稱到搜尋框
        searchAttractions(); // 呼叫搜尋景點函數
    }
});


// document.addEventListener('DOMContentLoaded', function() {

//     //登入這冊頁面跳轉
//     let manuSignInBtn=document.querySelector('#menu_signin_btn');
//     let signInBox=document.getElementById('signinBox');
//     let signInClose=document.querySelector('#signin_close');
//     let signInToSignUP=document.querySelector('#signInToSignUP');
//     let signUpBox=document.querySelector('#signUpBox');
//     let signUpClose=document.querySelector('#signup_close');
//     let signUpToSignin=document.querySelector('#signUpToSignin');

//     signInClose.addEventListener('click',function(){
//         signInBox.style.display = 'none';
//         overlay.style.display = 'none';
//     })
//     manuSignInBtn.addEventListener('click',function(){
//         signInBox.style.display = 'block';
//         overlay.style.display = 'block';
//     })
//     signInToSignUP.addEventListener('click',function(){
//         signUpBox.style.display='block'
//         signInBox.style.display = 'none';
//     })
//     signUpClose.addEventListener('click',function(){
//         signUpBox.style.display='none';
//         overlay.style.display = 'none';
//     })
//     signUpToSignin.addEventListener("click",function(){
//         signUpBox.style.display='none';
//         signInBox.style.display='block';
//     })

//     //登入資料提交給後端
//     let signInBtn = document.getElementById('signInBtn');
    
//     signInBtn.addEventListener('click',function(event){
//         event.preventDefault(); // 防止表單提交刷新頁面
//         let signInEmail = document.getElementById('signInEmail').value;
//         let signinPassword = document.getElementById('signinPassword').value;
//         let signInMessage = document.getElementById('signInMessage');

//         if (signInEmail===""||signinPassword===""){
//             event.preventDefault(); // 阻止表單提交
//             alert("請輸入完整資訊");
//             return;
//         }
        
//         // 將用戶輸入的值轉為 JSON 格式
//         let signInData = {
//             email: signInEmail,
//             password: signinPassword
//         };
//         // 將 JSON 格式的資料發送到後端
//         fetch('/api/user/auth',{
//             method:'PUT',
//             headers:{
//                 'Content-Type':'application/json'
//             },
//             body: JSON.stringify(signInData)
//         })
//         .then(response => response.json())
//         .then(data =>{
//             if (data.token) {
//                 localStorage.setItem('jwtToken', data.token);
//                 console.log("登入成功");
//             } else {
//                 signInMessage.textContent="帳號或密碼錯誤"
//                 console.log("登入失敗");
//             }
//         })
//         .catch(error=>console.error('Error',error));

//     });

//     //註冊資料
//     let signUpBtn = document.getElementById('signUpBtn');

//     signUpBtn.addEventListener('click',function(event){
//         event.preventDefault(); // 防止表單提交刷新頁面
//         let signUpName = document.getElementById('signUpName').value;
//         let signUpEmail = document.getElementById('signUpEmail').value;
//         let signUpPassword = document.getElementById('signUpPassword').value;
//         let signUpMessage = document.getElementById('signUpMessage');

//         if (signUpName===""||signUpEmail===""||signUpPassword===""){
//             event.preventDefault(); // 阻止表單提交
//             alert("請輸入完整資訊");
//             return;
//         }
        
//         // 將用戶輸入的值轉為 JSON 格式
//         signUpData={
//             name: signUpName,
//             email: signUpEmail,
//             password: signUpPassword
//         }
//         // 將 JSON 格式的資料發送到後端
//         fetch('/api/user',{
//             method:'POST',
//             headers:{
//                 'Content-Type':'application/json'
//             },
//             body: JSON.stringify(signUpData)
//         })
//         .then(response => response.json())
//         .then(data =>{
//             if (data.ok) {//是否存在OK屬性
//                 signUpMessage.textContent="註冊成功"
//                 console.log("註冊成功");
//             } else {
//                 signUpMessage.textContent="email已經註冊過"
//                 console.log("註冊失敗");
//             }

//         })
//         .catch(error=>console.error('Error',error));


//     });




// })







// // 將 token 儲存在 Local Storage 中
// let fetchUrl = async () => {
//     try {
//         //登入資料提交給後端
//         let signInBtn = document.getElementById('signInBtn');
//         let signInEmail = document.getElementById('signInEmail').value;
//         let signInPassword = document.getElementById('signinPassword').value;
//         signInBtn.addEventListener('click',function(event){
//             event.preventDefault(); // 防止表單提交刷新頁面
    
//             // 將用戶輸入的值轉為 JSON 格式
//             let loginData = {
//                 email: signInEmail,
//                 password: signInPassword
//             };
//             // 將 JSON 格式的資料發送到後端
//             fetch("/api/user/auth", {
//                 method: "PUT",
//                 headers:{
//                     'Content-Type':'application/json'
//                 },
//                 body: JSON.stringify(loginData)
//             })
//                 .then(function (response) {
//                     return response.json();
//                 })
//                 .then(function (data) {
//                     if (data.token) {
//                         localStorage.setItem('jwtToken', data.token);
//                         console.log("登入成功");
//                     } else {
//                         console.log("登入失敗");
//                     }
//                 })
//         });

//     } catch (error) {
//         console.error('token出錯：', error);
//     }
// }


document.addEventListener('DOMContentLoaded', function() {
    let token = localStorage.getItem('jwtToken');
       
    fetch("/api/user/auth", {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data=> {
        if(data.data!="null"){
            LogoutButton();
        }else{
            SigninButton();
        }
    })
    .catch(function (error) {
        console.error('驗證出錯：', error.message);
    });
    

});

function SigninButton() {
    // 在網頁上顯示登入/註冊按鈕
    // 按鈕綁定點擊事件，示登入註冊視窗
    let manuSignInBtn = document.getElementById('menu_signin_btn');
    manuSignInBtn.textContent = '登入/註冊';
    manuSignInBtn.addEventListener('click', signin);
}

function signin(){
        //登入註冊頁面跳轉
        
        let manuSignInBtn=document.querySelector('#menu_signin_btn');
        let signInBox=document.getElementById('signinBox');
        let signInClose=document.querySelector('#signin_close');
        let signInToSignUP=document.querySelector('#signInToSignUP');
        let signUpBox=document.querySelector('#signUpBox');
        let signUpClose=document.querySelector('#signup_close');
        let signUpToSignin=document.querySelector('#signUpToSignin');

        signInBox.style.display = 'block';
        overlay.style.display = 'block';

        signInClose.addEventListener('click',function(){
            signInBox.style.display = 'none';
            overlay.style.display = 'none';
        })
        manuSignInBtn.addEventListener('click',function(){
            signInBox.style.display = 'block';
            overlay.style.display = 'block';
        })
        signInToSignUP.addEventListener('click',function(){
            signUpBox.style.display='block'
            signInBox.style.display = 'none';
        })
        signUpClose.addEventListener('click',function(){
            signUpBox.style.display='none';
            overlay.style.display = 'none';
        })
        signUpToSignin.addEventListener("click",function(){
            signUpBox.style.display='none';
            signInBox.style.display='block';
        })
    
        //登入資料提交給後端
        let signInBtn = document.getElementById('signInBtn');
        
        signInBtn.addEventListener('click',function(event){
            event.preventDefault(); // 防止表單提交刷新頁面
            let signInEmail = document.getElementById('signInEmail').value;
            let signinPassword = document.getElementById('signinPassword').value;
            let signInMessage = document.getElementById('signInMessage');
            emailRule = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    
            if (signInEmail===""||signinPassword===""){
                event.preventDefault(); // 阻止表單提交
                alert("請輸入完整登入資訊");
                return;
            }else if(!emailRule.test(signInEmail)){
                alert("email格式輸入錯誤");
                return;
            }
            
            // 將用戶輸入的值轉為 JSON 格式
            let signInData = {
                email: signInEmail,
                password: signinPassword
            };
            // 將 JSON 格式的資料發送到後端
            fetch('/api/user/auth',{
                method:'PUT',
                headers:{
                    'Content-Type':'application/json'
                },
                body: JSON.stringify(signInData)
            })
            .then(response => response.json())
            .then(data =>{
                if (data.token) {
                    localStorage.setItem('jwtToken', data.token);
                    signInMessage.textContent="登入成功"
                    console.log("登入成功");
                    location.reload();
                } else {
                    signInMessage.textContent="email或密碼錯誤"
                    console.log("登入失敗");
                }
            })
            .catch(error=>console.error('Error',error));
    
        });
    
        //註冊資料
        let signUpBtn = document.getElementById('signUpBtn');
    
        signUpBtn.addEventListener('click',function(event){
            event.preventDefault(); // 防止表單提交刷新頁面
            let signUpName = document.getElementById('signUpName').value;
            let signUpEmail = document.getElementById('signUpEmail').value;
            let signUpPassword = document.getElementById('signUpPassword').value;
            let signUpMessage = document.getElementById('signUpMessage');
            emailRule = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    
            if (signUpName===""||signUpEmail===""||signUpPassword===""){
                event.preventDefault(); // 阻止表單提交
                alert("請輸入完整註冊資訊");
                return;
            }else if(!emailRule.test(signUpEmail)){
                alert("email格式輸入錯誤");
                return;
            }
            
            // 將用戶輸入的值轉為 JSON 格式
            signUpData={
                name: signUpName,
                email: signUpEmail,
                password: signUpPassword
            }
            // 將 JSON 格式的資料發送到後端
            fetch('/api/user',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body: JSON.stringify(signUpData)
            })
            .then(response => response.json())
            .then(data =>{
                if (data.ok) {//是否存在OK屬性
                    signUpMessage.textContent="註冊成功"
                    console.log("註冊成功");
                } else {
                    signUpMessage.textContent="email已經註冊過"
                    console.log("註冊失敗");
                }
    
            })
            .catch(error=>console.error('Error',error));
        });
}

function LogoutButton() {
    // 在網頁上顯示登出按鈕
    // 並為按鈕綁定點擊事件，以執行登出程序
    let manuSignInBtn = document.getElementById('menu_signin_btn');
    manuSignInBtn.textContent = '登出系統';
    manuSignInBtn.addEventListener('click', logout);
}

function logout() {
    // 清空 Local Storage 中的 Token 資訊
    localStorage.removeItem('jwtToken');
    // 重新載入相同頁面
    location.reload();
}