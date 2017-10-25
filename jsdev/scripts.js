function isType(type){
	return function(obj){
		return Object.prototype.toString.call(obj) === '[object '+ type+']';
	}
}

 
var vm = new Vue({
    el: "#app",
    data: {
        infoQ: {
            "name": "商品名",
            "code": "test02",
            "brand": "品牌",
            "tag": "现货",
            "imgs": [
                "http://",
                "http://",
                "http://"
            ],
            "brand": "SYL",
            "price": "0.01",
            "colors": ["红", "黄", "蓝", "绿"],
            "sizes": ["S", "M", "L"],
            "sku": {
                "红": { "sizes": [10, 12, 1], "total": 0 },
                "黄": { "sizes": [10, 12, 1], "total": 0 },
                "蓝": { "sizes": [10, 12, 1], "total": 0 },
                "绿": { "sizes": [10, 12, 1], "total": 0 }
            }
        },
        info: {},
        cart: {}, // "红": { S: 9, M:2, L:4 , total:0 } 
        counting: {
            key: "",
            color: "",
            sku: 0,
            size: "",
            count: 0,
            sizes: "",
            diff: 0 //计数差值
        },
        total: {
        	count: 0,
        	price: 0
        }
    },
    watch: {
        'counting.count': function(val, old){
            var counting = this.counting;
            var sku = this.info.sku;

            sku[counting.color].total = counting.total;
            // console.log(sku);
        }
    },
    computed: {
        _price: function() { return this.info.price; },
        _size: function() { return this.info.sizes; },
        isActive: function() {
        	return !!this.total.count;
        }, 
        checkedKey: function(){
        	return this.counting.color+"_"+this.counting.size;
        }, 
        colorsPack: function() {
            return (this.info.colors || []).join(",");
        },
        sizesPack: function() {
            return (this.info.sizes || []).join(",");
        },
        imgSlide: function() {
            var imgs = this.info.imgs || [];

            return {
                total: imgs.length,
                current: 0,
                src: imgs
            };
        }

    },  
    methods: {
    	showCover: function(){
    		var $cover = document.documentElement.querySelector('.cover');
    		$cover.style.display = "block";
    	},
    	hideCover: function(){
    		var $cover = document.documentElement.querySelector('.cover');
    		$cover.style.display = "none"; 
    	},
        toggleCheck: function($event) {
            var dataset = $event.target.dataset;
            
            var counting = this.counting;
            for (var key in counting) {
                counting[key] = dataset[key];
            }

            //- 数据反显购物车中已选数据
            var cart = this.cart;
            var color = dataset.color;
            var size = dataset.size;

            if (!cart[color]) {
                cart[color] = {};
                cart[color][size] = 0;
                cart[color].total = 0;
            } else {
                if (!cart[color][size]) {
                    cart[color][size] = 0;
                }
                if (typeof cart[color].total === undefined) {
                    cart[color].total = 0;
                }


            } 
            counting.count = cart[color][size];
            counting.total = cart[color].total;
            counting.key = color + "_"+ size;
        },
        inputCounter: function($event){
        	var counting = this.counting;
 			
 			var count = 0;
    		if(counting.key === ""){  
                alert("请选择商品");
            }  

        	count = $event.target.value;
        	if(/^\s*$/.test(count)){
        		count = '';
        	}else if( (/^[1-9]\d*|0$/g).test(count)){
        		count = (+count);
        		sku = +counting.sku;
        		if(count > sku){
	    			count = sku;
	    		} 
        	}else{
        		count = 0;
        	}
    		  
    		$event.target.value = count;


    		if(counting.count != count){
                this.cartUpdate(count);
            	/*counting.count = count;

            	//小计
	            var cart = this.cart;
	            var updateItem = cart[counting.color];
	            updateItem[counting.size]  = counting.count;

	            var sizes = this.info.sizes;
            	var total = 0; 
            	for(var i=0, len= sizes.length; i< len; i++){ 
            		var iCount = updateItem[sizes[i]];
            		total += (iCount || 0);
            	}
            	updateItem.total = total;
            	counting.total = total;

	  			//总计
	  			//console.log("--- total --");
	  			var count = 0;
	            for(var item in cart){
	            	count += (+cart[item].total);
	            	//console.log(cart[item]);
	            }

	            this.total.count  = count;
	            this.total.price = (count * this._price).toFixed(2);*/
	        } 
        },
        counter: function($event) {
            var counting = this.counting;

            if(counting.key === ""){
            	return alert("请选择商品");
            }

            var max = counting.sku;
            
            var flag = (+$event.target.dataset.flag);
            var diff = flag;
            
            var count = (+counting.count) + flag; 
 

            if (count < 0) { 
                count = 0;
                diff = 0; 
            } else if (count > max) {
                count = max;
                diff = 0;
            } 
  
            //数据有变化 更新当前数据
            if(diff){
                this.cartUpdate(count);
                return;
            	counting.count = count;
            	counting.total += diff;

            	//小计
	            var cart = this.cart;
	            var updateItem = cart[counting.color];
	            updateItem[counting.size]  = counting.count;
	            updateItem.total = counting.total;

	  			//总计
	  			console.log("--- total --");
	  			var count = 0;
	            for(var item in cart){
	            	count += (+cart[item].total);

	            	console.log(cart[item]);
	            }

	            this.total.count  = count;
	            this.total.price = (count * this._price).toFixed(2);
	        }
        },
        createOrder: function(){
        	if(this.total.count){
        	 	this.hideCover();
        	}else{
        		alert("您还未选择商品");
        	}
        },
        getProductDetail: function(){
        	var vm = this;
        	axios.get('demo-cart/data/product.json',{
        		params:{ id: "test02"}
        	}).then(function(response){
        		var res = response.data;
        		if(!res.hasError){
        			vm.info = res.data;
        			// console.log(vm.info );
        		}else{
        			alert(res.message);
        		}
        	}).catch(function(error){
        		// error massage tips
        	});
        },
        //-- 暂时无用
        cartUpdate: function(count) {
            var counting = this.counting;
            counting.count = count;

            //小计
            var cart = this.cart;
            var updateItem = cart[counting.color];
            updateItem[counting.size]  = counting.count;

            var sizes = this.info.sizes;
            var total = 0; 
            for(var i=0, len= sizes.length; i< len; i++){ 
                var iCount = updateItem[sizes[i]];
                total += (iCount || 0);
            }
            updateItem.total = total;
            counting.total = total;

            //总计
            console.clear();
            console.log("--- total --");
            var count = 0;
            for(var item in cart){
                count += (+cart[item].total);
                console.log(item, cart[item]);
            }

            this.total.count  = count;
            this.total.price = (count * this._price).toFixed(2);
        }
    },
    mounted: function() {
    	this.getProductDetail();
    }
});
 
/*
var product = (function(){

	function getProductDetail(){
		//- ajax get productdetail information
		$.ajax({
			url: "http//hostname/path/to/product_detail.json",
			cached: false,
			success: function(res){
				if(!res.hasError && !res.data){
					//call successFunction()  -> show productInfo
				} 
				return res.massage; 
			},
			error: function(){
				// warn message
			},
			complete: function(){
				// other handle
			}
		});

	var dataProduct = {
		"hasError": false,
		"message": "请求成功",
		"data": {
			"name": "商品名",
			"code": "test02",
			"brand": "品牌",
			"imgShow": [
				"http://",
				"http://",
				"http://"
			],
			"brand": "品牌",
			"price": "0.01",
			"colors": ["红", "黄", "蓝", "绿"],
			"size": ["S", "M", "L"],
			"sku": {
				"红": [10, 12, 1],
				"黄": [10, 12, 1],
				"蓝": [10, 12, 1],
				"绿": [10, 12, 1]
			}
		}

	};

	//- show productInfo
	function randerPage(data){
		
	}


	return {
		init: function(){

		}
	};

})();*/