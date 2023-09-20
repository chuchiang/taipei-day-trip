

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
        let attraction = document.getElementById('attraction');
        attraction.innerHTML="";
        attraction.textContent="沒有此景點";
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



document.addEventListener('DOMContentLoaded',function(){
    let morningRadio = document.getElementById('morning_radio');
    let afternoonRadio = document.getElementById('afternoon_radio');
    let tripPrice = document.getElementById('trip_price');
    let priceNotice = document.getElementById('price_notice');
    morningRadio.addEventListener('click',function(){
        priceNotice.style.display="none";
        tripPrice.textContent="新台幣 2000 元"

    });
    afternoonRadio.addEventListener('click',function(){
        priceNotice.style.display="none";
        tripPrice.textContent="新台幣 2500 元"
    });

});





