
let token = localStorage.getItem('jwtToken');
let bookingBtn = document.getElementById("booking_btn");

fetch("/api/user/auth", {
    method: "GET",
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
    .then(response => response.json())
    .then(data => {

        if (data.data != "null") {

            let headlineContent = document.createElement('div');
            headlineContent.classList.add('headline_content', 'b-19');
            headlineContent.textContent = "您好，" + data.data.name + "，待預訂的行程如下：";

            let headline = document.getElementById('headline');
            headline.appendChild(headlineContent);

            document.getElementById('contactName').setAttribute('value',data.data.name)//資料自動帶入
            document.getElementById('contactEmail').setAttribute('value',data.data.email)//資料自動帶入


        } else {
            window.location.href = '/';
        }

    })
    .catch(function (error) {
        console.error('驗證出錯：', error.message);
    });

let fetchUrl = async()=>{
    await fetch("/api/booking", {
        method: "GET",
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(data => {
            let dataLength = data.length;
            if (dataLength > 0) {
                let totalRrice = 0; // 在這裡定義 totalRrice 變數
                data.forEach(list => {
                    let message = document.getElementById('message');

                    let booking = document.createElement('div');
                    booking.classList.add('booking');

                    let image = document.createElement('img');
                    image.src = list.data.attraction.image;

                    // 將最終創建的元素添加到文檔中

                    let bookingImg = document.createElement('div');
                    bookingImg.classList.add('booking_img')


                    let bookingContent = document.createElement('div');
                    bookingContent.classList.add('booking_content');


                    let bookingName = document.createElement('div');
                    bookingName.classList.add('booking_content_name');
                    bookingName.textContent = "台北一日遊：" + list.data.attraction.name;

                    let bookingDate = document.createElement('div');
                    bookingDate.classList.add('booking_content_date', 'm-16');
                    bookingDate.innerHTML = '<span class="b-16">日期：</span>' + list.data.date;

                    let bookingTime = document.createElement('div');
                    bookingTime.classList.add('booking_content_time', 'm-16');

                    if (list.data.time == "morning") {
                        bookingTime.innerHTML = '<span class="b-16">時間：</span>' + "早上 9 點到下午 4 點";
                    } else {
                        bookingTime.innerHTML = '<span class="b-16">時間：</span>' + "下午 1 點到下午 8 點";
                    }

                    let bookingPrice = document.createElement('div');
                    bookingPrice.classList.add('booking_content_price', 'm-16');
                    bookingPrice.innerHTML = '<span class="b-16">費用：</span>' +"新台幣 "+ list.data.price + "元";

                    let bookingAddress = document.createElement('div');
                    bookingAddress.classList.add('booking_content_address', 'm-16');
                    bookingAddress.innerHTML = '<span class="b-16">地點：</span>' + list.data.attraction.address;

                    let bookingDelete = document.createElement('button');
                    bookingDelete.classList.add('booking_delete');
                    bookingDelete.id = list.data.booking_id;
                    bookingDelete.dataset.attraction = list.data.attraction.id; //dataset 提供了一个元素自定義，data- 開頭
                    

                    let deleteImage = document.createElement('img');
                    deleteImage.src = `/static/img/icon/delete.png`;

                    let price =list.data.price;
                    totalRrice = totalRrice + price

                    booking.appendChild(bookingImg);
                    booking.appendChild(bookingContent);
                    bookingImg.appendChild(image);

                    bookingContent.appendChild(bookingName);
                    bookingContent.appendChild(bookingDate);
                    bookingContent.appendChild(bookingTime);
                    bookingContent.appendChild(bookingPrice);
                    bookingContent.appendChild(bookingAddress);
                    message.innerHTML = "";

                    bookingDelete.appendChild(deleteImage);
                    bookingContent.appendChild(bookingDelete);

                    let block = document.getElementById('block');
                    block.prepend(booking);

                });

                let bookingRrice = document.createElement("div");
                bookingRrice.classList.add('total_price', 'b-16');
                bookingRrice.innerHTML = "總價：新台幣 " + totalRrice + "元";
                let total = document.getElementById('total');
                total.prepend(bookingRrice);

            } else {
                let block = document.getElementById('block');
                block.innerHTML = "";
                message.innerHTML = "目前沒有任何待預定行程";
            }
        })
        .catch(function (error) {
            console.error('資料出錯：', error.message);
        });
}




window.onload = async function() {
    await fetchUrl();//await 等待fetchUrl執行完後才執行
    let deleteBtn = document.getElementsByClassName("booking_delete");

    for (let i = 0; i < deleteBtn.length; i++) {
        
        let button = deleteBtn[i];
        let deleteId = button.getAttribute("id");
        
        button.addEventListener("click", function () {
            fetch('/api/booking', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: deleteId // 傳送刪除數字
            })
                .then(response => response.json())
                .then(data => {
                    if (data.ok) {
                        location.reload();
                        
                        let block = document.getElementById('block');
                        let message = document.getElementById('message');
                        block.innerHTML = "";
                        message.innerHTML = "目前沒有任何待預定行程";

                    } else {
                        console.error('刪除出錯：', error.message);
                    }

                })
                .catch(function (error) {
                    console.error('驗證出錯：', error.message);
                });

        });

    }
    document.getElementById("loadingScreen").style.display = "none";//網頁最後都會跑這個function，所以可以把loadind畫面加這
};

