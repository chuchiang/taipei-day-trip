let token = localStorage.getItem('jwtToken');

fetch(`/api/member/order`, {
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

        if (data.data !== "null") {
            data.forEach(list => {
               
                let contactRecordNumber = document.createElement('div');
                contactRecordNumber.classList.add('contact_record_number', 'm-16')
                contactRecordNumber.textContent=list.data.member_order;

                let contactRecordBtn = document.createElement('button');
                contactRecordBtn.classList.add('contact_recordd_btn');
                contactRecordBtn.textContent = "訂單紀錄";
                contactRecordBtn.id = list.data.member_order;

                // 設定onclick事件
                contactRecordBtn.onclick = function () {
                    window.location.href = 'thankyou?number=' + contactRecordBtn.id;
                };

                let contactRecord = document.createElement('div');
                contactRecord.classList.add('contact_record')

                let contant = document.getElementById('contant');
                contactRecord.appendChild(contactRecordNumber);
                contactRecord.appendChild(contactRecordBtn);
                contant.appendChild(contactRecord);

            })

        }
        else{

            let contant = document.getElementById('contant');
            contant.innerHTML = "目前沒有任何已完成訂單";
        }


    });



