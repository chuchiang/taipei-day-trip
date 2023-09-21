

//取得目前瀏覽器網址
let currentURL = window.location.href;

// 利用正則表達式取得網址中的id部分
let match = currentURL.match(/\/attraction\/(\d+)/);
let id = match[1];



let fetchUrl = async()=>{
// 如果成功匹配，match[1] 就是取得的id值
    if (id<=58) {
        await fetch(`/api/attraction/${id}`)
        .then(response => response.json())
        .then(data => {
            let dataLength = data.data.length;
                if (dataLength > 0) {
                    data.data.forEach(attraction =>{
            
                        // 創建包含圖片和名稱的<ul>元素
                        let attractionImgsContent = document.createElement('ul');
                        attractionImgsContent.classList.add('attraction_imgs_content');
                        attractionImgsContent.id = "slider";

                        // 創建dot <ul>元素
                        let attractionImgsDots = document.createElement('ul');
                        attractionImgsDots.classList.add('attraction_imgs_btns');
                        attractionImgsDots.id = "dots";                    

                        attraction.images.forEach((datImages) =>{
                    
                            let attractionImgsContentUnactive = document.createElement('li');
                            attractionImgsContentUnactive.classList.add('attraction_imgs_content_unactive');
                            // 創建圖片<img>元素
                            let imagenmore = document.createElement('img');
                            imagenmore.src = datImages;
                            imagenmore.alt = 'picture';
                            attractionImgsContentUnactive.appendChild(imagenmore);
                            attractionImgsContent.appendChild(attractionImgsContentUnactive);

                            let attractionImgsDot = document.createElement('li');
                            attractionImgsDots.appendChild(attractionImgsDot);

                        })

                        //name
                        let attractionTourName = document.createElement('div');
                        attractionTourName.classList.add('attraction_tour_name');
                        attractionTourName.textContent = attraction.name;
                
                        //category
                        let attractionTourCategory = document.createElement('div');
                        attractionTourCategory.classList.add('attraction_tour_category');
                        attractionTourCategory.textContent = attraction.category+" at "+attraction.mrt;

                        //description
                        let contentDescription = document.createElement('div');
                        contentDescription.classList.add('content_description');
                        contentDescription.textContent = attraction.description;

                        //address
                        let contentAddressContent = document.createElement('div');
                        contentAddressContent.classList.add('content_address_content');
                        contentAddressContent.textContent = attraction.address;

                        //transport
                        let contentTransportsContent = document.createElement('div');
                        contentTransportsContent.classList.add('content_transports_content');
                        contentTransportsContent.textContent = "捷運站名："+attraction.transport;


                        // 將最終創建的元素添加到文檔中
                        let attractionContent = document.getElementById('attraction_imgs'); // 替換成你想要添加的父容器的ID
                        let attractionTour = document.getElementById('tour');
                        attractionContent.prepend(attractionImgsContent);
                        attractionTour.prepend(attractionTourCategory);  
                        attractionTour.prepend(attractionTourName);   
                        let content = document.getElementById('content');
                        content.prepend(contentDescription);
                        let contentAddress = document.getElementById('contentAddress');
                        contentAddress.appendChild(contentAddressContent);
                        let contentTransport = document.getElementById('contentTransport');
                        contentTransport.appendChild(contentTransportsContent);
                        attractionContent.appendChild(attractionImgsDots)

                    });

                }
            

        });

    }
    else{
        let attractionMessage = document.getElementById('attraction_message');
        let separatorImg = document.getElementById('separator_img');
        let content = document.getElementById('content');
        attraction.innerHTML="";
        content.style.display='none';
        separatorImg.style.display='none';
        attractionMessage.textContent="沒有此景點";
        content.innerHTML="";
    }
}

    

window.onload = async function() {
    await fetchUrl();//await 等待fetchUrl執行完後才執行
    let rightBtn = document.getElementById('rightbtn');
    let leftBtn = document.getElementById('leftbtn');
    let slider = document.getElementById('slider');
    let dots = document.getElementById('dots');
    let children = dots.children;//dots 子元素存在children

    let liElements = slider.getElementsByTagName('li');// 取得 ul 元素下的所有 li 元素
    let imgCounts = liElements.length;//取得liElements長度，為圖片個數
    rightBtn.addEventListener("click", () => (slideProxy.index += 1));//rightBtn點擊後slideProxy.index 值+1
    leftBtn.addEventListener("click", () => (slideProxy.index -= 1));//leftBtn點擊後slideProxy.index 值-+1
    setClickEventToDots();
    window.oversize=debounce(calculateWidth);//將 calculateWidth 函式包裝在 debounce 函式中，賦值給全局變數 oversize
    let slideProps = { index: 0 };//slideProps 屬性 index，其初始值為 0。
    let slideHanlder = {//slideHandler 的物件，這個物件將用作後面代理（Proxy）的處理器，用來控制對 slideProps 物件的操作
        set (obj,prop,value){//set 方法 這個方法會在對 slideProps 物件的屬性進行設置（修改）時被調用。它接受三個參數：obj：被代理的目標物件，即 slideProps。prop：被設置的屬性名稱，這裡是 "index"。value：要設置的新值。
            if (prop == "index"){
                if (value >= imgCounts) {
                    value = value % imgCounts; //value 的範圍在 0 都在第一頁
                }
                if (value < 0){ //value 的範圍是負數都停在第一張
                    return;
                }
                console.log(value)
                setDotToInactive();
                obj[prop]=value;//slideProps 物件中的 "index" 屬性設置為新的值 value，這一行實際上修改了 slideProxy.index
                calculateWidth();
                setActiveDot();
            }
        },
    };
    let slideProxy = new Proxy(slideProps,slideHanlder);//創建了一個 Proxy 物件 slideProxy，它會監聽 slideProps 物件的變化
    setActiveDot();
    //calculateWidth 函式，用來計算輪播容器的寬度，並將 slider 容器捲動到相應位置，以顯示當前圖片。
    function calculateWidth(){
        let imgWith = slider.offsetWidth;
        let recomputeWidth = slideProps.index*imgWith;
        slider.scrollLeft = recomputeWidth;
    }
    
    //setDotToInactive 函式，將當前活動的指示點設置為非活動狀態
    function setDotToInactive(){
        let{index}=slideProps
        children[index].classList.remove('dot--active')
    }
    //setActiveDot 函式，將當前圖片對應的指示點設置為活動狀態
    function setActiveDot() {
        let { index } = slideProps
        children[index].classList.add('dot--active')
    }
    //為所有指示點添加點擊事件的監聽器。當某個指示點被點擊時，會觸發箭頭函式，將相應的圖片顯示出來
    function setClickEventToDots() {
        for (let i = 0; i < dots.children.length; i++) {
          const li = dots.children[i]
          li.addEventListener('click', () => {
            slideProxy.index = i
          })
        }
      }
    //定義了一個 debounce 函式，它用來節流某個函式的執行，以避免在短時間內多次觸發
    function debounce(func,timeout=100){
        let timer;
        return(...args)=>{
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(this, args);
            }, timeout);
        }
    } 
       
}



//登入

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