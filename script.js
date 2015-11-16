function Shop() {

  var that = this;

  this.elements = {
    list: document.getElementById("items"),
    items: document.getElementById("items").getElementsByTagName("li"),
    cartItems: document.getElementById("cartItems"),
    cart: document.getElementById("cart"),
    plus: document.createElement("img"),
    subTotal: document.getElementById("subtotal").getElementsByTagName("span")[1],
    clickedItem: false
  };

  this.settings = {
    ns: (navigator.appName == "Netscape") ? true : false
  };

  this.highlightItem = function(clickedItem) {
    var item, i=0;
    while(item = this.elements.items[i++]) {
      this.unhighlightItem(item);
    }
    clickedItem.setAttribute("class", "active");
  };

  this.unhighlightItem = function(item) {
    item.removeAttribute("class");
  };

  this.createDragBox = function(clickedItem, drag, e) {
    this.elements.dragBox = document.createElement("div");
    this.elements.dragBox.setAttribute("id", "dragBox");
    var childs = clickedItem.getElementsByTagName("*");
    var child, i=0;
    while(child = childs[i++]) {
      if(child.parentNode != clickedItem) continue;
      var clone = child.cloneNode(true);
      this.elements.dragBox.appendChild(clone);
    }
    this.settings.itemX = clickedItem.offsetLeft + this.elements.cart.offsetWidth - this.elements.list.scrollLeft;
    this.settings.itemY = clickedItem.offsetTop + document.getElementById("head").offsetHeight - this.elements.list.scrollTop;
    this.settings.dragBoxX = e.clientX - clickedItem.offsetLeft - this.elements.cart.offsetWidth + this.elements.list.scrollLeft;
    this.settings.dragBoxY = e.clientY - clickedItem.offsetTop - document.getElementById("head").offsetHeight + this.elements.list.scrollTop;
    document.getElementById("body").appendChild(this.elements.dragBox);

    if(drag) {
      document.onmousemove = function(e) {
        that.moveDragBox(e);
      };
      document.onmouseup = function() {
        that.deleteDragBox();
      };
    } else {
      this.addItemToCart();
    }
  };

  this.deleteDragBox = function() {
    document.getElementById("body").removeChild(this.elements.dragBox);
    document.onmousemove = null;
    document.onmouseup = null;
  };

  this.moveDragBox = function(e) {
    this.settings.y = e.clientY - this.settings.dragBoxY;
    this.settings.x = e.clientX - this.settings.dragBoxX;
    this.elements.dragBox.style.top = this.settings.y + "px";
    this.elements.dragBox.style.left = this.settings.x + "px";
    if(
      e.clientX > this.elements.cartItems.offsetLeft &&
      e.clientX <= this.elements.cartItems.offsetLeft+this.elements.cartItems.offsetWidth &&
      e.clientY > document.getElementById("head").offsetHeight + this.elements.cartItems.offsetTop &&
      e.clientY <= document.getElementById("head").offsetHeight + this.elements.cartItems.offsetTop+this.elements.cartItems.offsetHeight
    ) {
      this.elements.cart.setAttribute("class", "active");
      this.elements.plus.style.top = (e.clientY+11)+"px";
      this.elements.plus.style.left = (e.clientX-2)+"px";
      document.onmouseup = function() {
        that.addItemToCart();
      };
    } else {
      this.elements.cart.removeAttribute("class");
      this.elements.plus.style.top = "-9999px";
      this.elements.plus.style.left = "-9999px";
      document.onmouseup = function() {
        that.moveDragBoxBack();
      };
    }
  };

  this.moveDragBoxBack = function() {
    document.onmousemove = null;
    document.onmouseup = null;
    var moveByX = this.settings.itemX - this.settings.x;
    var moveByY = this.settings.itemY - this.settings.y;
    var i = 15;
    var interval = setInterval(function() {
      var x = Math.round(Math.cos(Math.PI * ++i/10)*moveByX);
      var y = Math.round(Math.cos(Math.PI * i/10)*moveByY);
      that.elements.dragBox.style.left = (that.settings.x + x) + "px";
      that.elements.dragBox.style.top = (that.settings.y + y) + "px";
      if(x == moveByX || y == moveByY) {
        clearInterval(interval);
        that.deleteDragBox();
      }
    }, 2);
  };

  this.addItemToCart = function() {
    this.removeInfo();
    document.onmousemove = null;
    document.onmouseup = null;
    this.elements.dragBox.style.top = "-9999px";
    this.elements.dragBox.style.left = "-9999px";
    this.unhighlightItem(this.elements.cart);
    this.elements.plus.style.top = "-9999px";
    this.elements.plus.style.left = "-9999px";

    var index = this.sameItemInCart();
    if(index) {
      var i = index-1;
      this.elements.cartItems.getElementsByTagName("li")[i].getElementsByTagName("p")[1].firstChild.nodeValue = parseInt(this.elements.cartItems.getElementsByTagName("li")[i].getElementsByTagName("p")[1].firstChild.nodeValue) + 1;
    } else {
      var li = document.createElement("li");
      var h4 = document.createElement("h4");
      var img = document.createElement("img");
      img.setAttribute("src", this.elements.dragBox.getElementsByTagName("img")[0].getAttribute("src"));
      img.setAttribute("height", "50");
      img.setAttribute("width", new String(Math.round((50/parseInt(this.elements.dragBox.getElementsByTagName("img")[0].getAttribute("height"))*parseInt(this.elements.dragBox.getElementsByTagName("img")[0].getAttribute("width"))))));
      h4.appendChild(img);
      var span = document.createElement("span");
      var spanTxt = document.createTextNode(this.elements.dragBox.getElementsByTagName("h2")[0].childNodes[2].nodeValue);
      span.appendChild(spanTxt);
      h4.appendChild(span);
      li.appendChild(h4);
      var price = document.createElement("p");
      var priceTxt = document.createTextNode(this.elements.dragBox.getElementsByTagName("p")[0].firstChild.nodeValue);
      price.appendChild(priceTxt);
      price.setAttribute("class", "price");
      li.appendChild(price);
      var quantity = document.createElement("p");
      var quantityTxt = document.createTextNode("1");
      quantity.appendChild(quantityTxt);
      quantity.setAttribute("class", "quantity");
      li.appendChild(quantity);
      li.onmousedown = function() {
        that.settings.activeCartItem = true;
        if(this != that.elements.activeCartItem)
          that.activateCartItem(this);
      };
      document.onmousedown = function() {
        if(!that.settings.activeCartItem)
          that.deactivateCartItem();
        that.settings.activeCartItem = false;
      };
      this.elements.cartItems.appendChild(li);
    }
    this.calculateSubTotal();
    this.deleteDragBox();
  };

  this.sameItemInCart = function() {
    var dragBoxImg = this.elements.dragBox.getElementsByTagName("img")[0].getAttribute("src");
    var img, i=0;
    if(this.elements.cartItems.getElementsByTagName("img").length == 0) return false;
    while(img = this.elements.cartItems.getElementsByTagName("img")[i++]) {
      if(img.getAttribute("src") == dragBoxImg) {
        return (i);
      }
    }
    return false;
  };

  this.removeInfo = function() {
    this.elements.cart.getElementsByTagName("p")[0].style.display = "none";
  };

  this.calculateSubTotal = function() {
    var price, quantity,
    i = 0, item, total = 0;
    while(item = this.elements.cartItems.getElementsByTagName("li")[i++]) {
      price = item.getElementsByTagName("p")[0].firstChild.nodeValue;
      price = price.substring(1,price.length);
      quantity = parseInt(item.getElementsByTagName("p")[1].firstChild.nodeValue);
      total+= price*quantity;
    }
    this.elements.subTotal.firstChild.nodeValue = "$"+Math.round(total*100)/100;
  };

  this.activateCartItem = function(clickedItem) {
    this.deactivateCartItem();
    this.elements.activeCartItem = clickedItem;
    clickedItem.setAttribute("id", "active");
    this.createToolBox();
  };

  this.deactivateCartItem = function() {
    if(!this.elements.activeCartItem) return;
    this.elements.activeCartItem.removeChild(this.elements.toolBox);
    this.elements.activeCartItem.removeAttribute("id");
    this.elements.activeCartItem = false;
  };

  this.deleteItemFromCart = function() {
    this.elements.cartItems.removeChild(this.elements.activeCartItem);
    this.calculateSubTotal();
  };

  this.createToolBox = function() {
    var tools = document.createElement("div");
    tools.setAttribute("id", "tools");
    var remove = document.createElement("p");
    var removeTxt = document.createTextNode("Delete");
    remove.appendChild(removeTxt);
    remove.setAttribute("id", "remove");
    remove.onclick = function() {
      that.deleteItemFromCart();
    };
    tools.appendChild(remove);
    var quantity = document.createElement("p");
    quantity.setAttribute("id", "quantityBox");
    var label = document.createElement("label");
    var labelTxt = document.createTextNode("Edit quantity: ");
    label.appendChild(labelTxt);
    var input = document.createElement("input");
    input.setAttribute("id", "quantity");
    input.setAttribute("type", "text");
    input.setAttribute("maxlength", "2");
    input.setAttribute("value", new String(document.getElementById("active").getElementsByTagName("p")[1].firstChild.nodeValue));
    this.settings.initVal = new String(document.getElementById("active").getElementsByTagName("p")[1].firstChild.nodeValue);
    input.setAttribute("size", "2");
    input.onkeyup = function() {
      if(this.value > 0 && !isNaN(parseInt(this.value)) && this.value != "") {
        that.elements.activeCartItem.getElementsByTagName("p")[1].firstChild.nodeValue = parseInt(this.value);
        that.calculateSubTotal();
      } else if(this.value != "") {
        this.value = that.settings.initVal;
      }
    };
    label.appendChild(input);
    quantity.appendChild(label);
    tools.appendChild(quantity);
    this.elements.toolBox = tools;
    this.elements.activeCartItem.appendChild(this.elements.toolBox);
  };

  this.init = function() {
    this.elements.plus.setAttribute("src", "gfx/plus.png");
    this.elements.plus.setAttribute("class", "cursor");
    document.getElementById("body").appendChild(this.elements.plus);
    this.elements.cartItems.removeChild(document.getElementById("hide"));
    var item, i=0;
    while(item = this.elements.items[i++]) {
      item.onmousedown = function(e) {
        that.createDragBox(this, true, e);
        that.highlightItem(this);
        return false;
      };
      item.ondblclick = function(e) {
        that.createDragBox(this, false, e);
        return false;
      };
    }

  };

  this.init();
}

window.onload = function() {
  new Shop();
};
