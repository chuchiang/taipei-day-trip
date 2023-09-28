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
            headlineContent.classList.add('headline_content','b-19');
            headlineContent.textContent = "您好，" + data.data.name + "，待預訂的行程如下：";

            let headline = document.getElementById('headline');
            headline.appendChild(headlineContent)

        }else{
            window.location.href = '/';
        }

    })
    .catch(function (error) {
        console.error('驗證出錯：', error.message);
    });


fetch("/api/booking", {
    method: "GET",
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
    .then(response => response.json())
    .then(data => {
        let dataLength = data.length;
        if (dataLength > 0) {
            data.forEach(list => {
                let message = document.getElementById('message');

                let image = document.createElement('img');
                image.src = list.data.attraction.image;

                let bookingName = document.createElement('div');
                bookingName.classList.add('booking_content_name');
                bookingName.textContent = "台北一日遊：" + list.data.attraction.name;

                let bookingDate = document.createElement('div');
                bookingDate.classList.add('booking_content_date', 'm-16');
                bookingDate.innerHTML = '<span class="b-16">日期：</span>' + list.data.date;

                let bookingTime = document.createElement('div');
                bookingTime.classList.add('booking_content_time', 'm-16');

                if (list.data.time=="morning"){
                    bookingTime.innerHTML = '<span class="b-16">時間：</span>' + "早上 9 點到下午 4 點";    
                }else{
                    bookingTime.innerHTML = '<span class="b-16">時間：</span>' + "下午 1 點到下午 8 點";   
                }

                let bookingPrice = document.createElement('div');
                bookingPrice.classList.add('booking_content_price', 'm-16');
                bookingPrice.innerHTML = '<span class="b-16">費用：</span>' + list.data.price;

                let bookingAddress = document.createElement('div');
                bookingAddress.classList.add('booking_content_address', 'm-16');
                bookingAddress.innerHTML = '<span class="b-16">地點：</span>' + list.data.attraction.address;

                // 將最終創建的元素添加到文檔中
                let bookingImg = document.getElementById('booking_img');
                bookingImg.appendChild(image);

                let bookingContent = document.getElementById('booking_content');
                bookingContent.appendChild(bookingName);
                bookingContent.appendChild(bookingDate);
                bookingContent.appendChild(bookingTime);
                bookingContent.appendChild(bookingPrice);
                bookingContent.appendChild(bookingAddress);

                message.innerHTML = "";

            })
        } else {
            let block = document.getElementById('block');
            block.innerHTML = "";
            message.innerHTML = "目前沒有任何待預定行程";
        }
    })
    .catch(function (error) {
        console.error('資料出錯：', error.message);
    });




let bookingDelete = document.getElementById("bookingDelete");

bookingDelete.addEventListener('click',function(){

    fetch('/api/booking',{
        method:'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            location.reload();
            let block = document.getElementById('block');
            let message = document.getElementById('message');
            block.innerHTML = "";
            message.innerHTML = "目前沒有任何待預定行程";

        }else{
            console.error('刪除出錯：', error.message);
        }

    })
    .catch(function (error) {
        console.error('驗證出錯：', error.message);
    });


});