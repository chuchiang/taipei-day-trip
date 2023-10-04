window.addEventListener("load", function () {
    let loadingScreen = document.getElementById("loadingScreen");
    loadingScreen.style.display = "none";
});

let urlParams = new URLSearchParams(window.location.search);
let orderNumber = urlParams.get('number');

let contactOrderNumber = document.createElement('div');
contactOrderNumber.classList.add('contact_number_order', 'b-18');
contactOrderNumber.textContent = "訂單編號：" + orderNumber;

let contactNumber = document.getElementById('contact_number')

contactNumber.prepend(contactOrderNumber)

let token = localStorage.getItem('jwtToken');



fetch(`/api/orders/${orderNumber}`, {
    method: "GET",
    headers: {
        'Authorization': `Bearer ${token}`,
    },
})
    .then(response =>{
        console.log(response)
        return response.json();
    })
    .then(data => {

        if (data[0].data !== "null") {
            data.forEach(list => {
                let contactOrder = document.createElement('div');
                contactOrder.classList.add('contact_order');

                let image = document.createElement('img');
                image.src = list.data.trip.attraction.image;


                let contactOrderImg = document.createElement('div');
                contactOrderImg.classList.add('contact_order_img')

                let contactOrderContent = document.createElement('div');
                contactOrderContent.classList.add('contact_order_content');

                let contactOrderContentName = document.createElement('div');
                contactOrderContentName.classList.add('contact_order_content_name');
                contactOrderContentName.textContent = "台北一日遊：" + list.data.trip.attraction.name;

                let contactOrderContentDate = document.createElement('div');
                contactOrderContentDate.classList.add('contact_order_content_date', 'm-16');
                contactOrderContentDate.innerHTML = '<span class="b-16">日期：</span>' + list.data.trip.date;

                let contactOrderContentTime = document.createElement('div');
                contactOrderContentTime.classList.add('contact_order_content_time', 'm-16');

                if (list.data.trip.time == "morning") {
                    contactOrderContentTime.innerHTML = '<span class="b-16">時間：</span>' + "早上 9 點到下午 4 點";
                } else {
                    contactOrderContentTime.innerHTML = '<span class="b-16">時間：</span>' + "下午 1 點到下午 8 點";
                }

                let contactOrderContentPrice = document.createElement('div');
                contactOrderContentPrice.classList.add('contact_order_content_price', 'm-16');
                contactOrderContentPrice.innerHTML = '<span class="b-16">費用：</span>' + "新台幣 " + list.data.price + "元";

                let contactOrderContentAddress = document.createElement('div');
                contactOrderContentAddress.classList.add('contact_order_content_address', 'm-16');
                contactOrderContentAddress.innerHTML = '<span class="b-16">地點：</span>' + list.data.trip.attraction.address;

                let deleteImage = document.createElement('img');
                deleteImage.src = `/static/icon/delete.png`;

                contactOrder.appendChild(contactOrderImg);
                contactOrder.appendChild(contactOrderContent);
                contactOrderImg.appendChild(image);

                contactOrderContent.appendChild(contactOrderContentName);
                contactOrderContent.appendChild(contactOrderContentDate);
                contactOrderContent.appendChild(contactOrderContentTime);
                contactOrderContent.appendChild(contactOrderContentPrice);
                contactOrderContent.appendChild(contactOrderContentAddress);
                let block = document.getElementById('block'); 
                block.appendChild(contactOrder);
              
            })

        }
        else{
            let contactMessage = document.getElementById('contact_message');
            block.innerHTML = "";
            contactMessage.innerHTML = "目前沒有任何已完成訂單";
        }

 

    });

   

