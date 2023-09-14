

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
    await fetchUrl();
    let rightBtn = document.getElementById('rightbtn');
    let leftBtn = document.getElementById('leftbtn');
    let slider = document.getElementById('slider');
    let dots = document.getElementById('dots');
    let children = dots.children;

    // 取得 ul 元素下的所有 li 元素
    let liElements = slider.getElementsByTagName('li');
    let imgCounts = liElements.length;
    rightBtn.addEventListener("click", () => (slideProxy.index += 1));
    leftBtn.addEventListener("click", () => (slideProxy.index -= 1));
    setClickEventToDots();
    window.oversize=debounce(calculateWidth);
    let slideProps = { index: 0 };
    let slideHanlder = {
        set (obj,prop,value){
            if (prop == "index"){
                if (value < 0 || value >= imgCounts) return;
                setDotToInactive();
                obj[prop]=value;
                calculateWidth();
                setActiveDot();
            }
        },
    };
    let slideProxy = new Proxy(slideProps,slideHanlder);
    setActiveDot();
    function calculateWidth(){
        let imgWith = slider.offsetWidth;
        let recomputeWidth = slideProps.index*imgWith;
        slider.scrollLeft = recomputeWidth;
       
    }
    function setDotToInactive(){
        let{index}=slideProps
        children[index].classList.remove('dot--active')
    }
    function setActiveDot() {
        let { index } = slideProps
        children[index].classList.add('dot--active')
    }
    function setClickEventToDots() {
        for (let i = 0; i < dots.children.length; i++) {
          const li = dots.children[i]
          li.addEventListener('click', () => {
            slideProxy.index = i
          })
        }
      }
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





