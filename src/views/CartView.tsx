import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ADD_TO_CART, REMOVE_FROM_CART } from '../redux/actions/cart';
import '../styles/Cart/Cart.scss'
class CartView extends Component<{}, {
    cartItems: Array<Object>,
    quantity: Number,
    total: Number
}> {
    constructor(props) {
        super(props);
        this.state = {
            cartItems: [],
            quantity: 0,
            total: 0
        }
    }
    updateSelectedAttributeListItems(selectedAttributes) {
        console.log(this.state)
        const cartItems = document.querySelectorAll(".cart-attributes");
        selectedAttributes.forEach((item, index) => {
            Array.from(cartItems[index].children).forEach(element => {
                const attributeType = element.attributes[1].nodeValue;
                const attributeIndex = item[element.attributes[2].nodeValue];
                const selectedElement = element.children[1].children[attributeIndex];
                if (attributeType === "text") {
                    selectedElement.style.background = "var(--main-text-color)";
                    selectedElement.style.color = "white";
                }
                else {
                    selectedElement.style.border = "1px solid var(--main-green-color)";
                }
            });

        })
    }
    getSelectedAttributes() {

    }
    componentDidMount() {
        if (this.state.cartItems.length === 0) {
            const selectedAttributes = Object.keys(this.props.cart).map(item =>
                JSON.parse(item.slice(1, item.length - 1))
            )
            Object.values(this.props.cart).forEach(item => {
                item.selectedGalleryIndex = 0
            })
            const cartItems = Object.values(this.props.cart);
            const quantity = cartItems.reduce((previousValue, currentValue) => { return previousValue + currentValue.quantity }, 0);
            const total = cartItems.reduce((previousValue, currentValue) => { return previousValue + this.getPriceAmountForProductPerLabel(currentValue) }, 0);
            console.log(this.props)
            this.setState({
                cartItems,
                quantity,
                total
            }, () => this.updateSelectedAttributeListItems(selectedAttributes))

        }
    }
    componentDidUpdate(prevProps) {
        if (Object.keys(prevProps.cart).length !== Object.keys(this.props.cart).length) {
            this.setState({
                cartItems: Object.values(this.props.cart)
            })
        }
    }
    getPriceAmountForProductPerLabel(product) {
        return product.prices.find(price => price.currency.label === this.props.currency.label).amount
    }
    showCurrencyForProduct(product) {
        return this.getPriceAmountForProductPerLabel(product) + " " + this.props.currency.symbol;
    }
    renderAttributeValues(attribute) {
        let attributeValues = attribute.items.map((item, i) => {
            return <li key={i} style={attribute.type === "swatch" ?
                { background: item.value, border: "1px solid", aspectRatio: "1/1", borderColor: "var(--main-text-color)" } :
                {}} data-value={item.value} data-attribute-id={attribute.id} data-item-id={item.id}>{attribute.type === "swatch" ? "" : item.value}</li>
        })
        return attributeValues;
    }
    handleGalleryImageChange(ev, item) {
        const isIncrement = ev.target.classList[0].includes("next");
        if (isIncrement) {
            if (item.selectedGalleryIndex >= item.gallery.length - 1) item.selectedGalleryIndex = 0;
            else item.selectedGalleryIndex = item.selectedGalleryIndex + 1;
        }
        else {
            if (item.selectedGalleryIndex <= 0) item.selectedGalleryIndex = item.gallery.length - 1;
            else item.selectedGalleryIndex = item.selectedGalleryIndex - 1;
        }
        this.setState({
            cartItems: this.state.cartItems
        })
    }
    handleProductQuantity(ev, item, action) {
        if (action === "increment") {
            this.props.ADD_TO_CART(item);
        }
        else {
            this.props.REMOVE_FROM_CART(item);
        }
    }
    getTaxValue() {
        const taxValue = 0.21 * this.state.total;
        return this.props.currency.symbol + this.twoDecimalTrunc(taxValue);
    }
    twoDecimalTrunc = num => Math.trunc(num * 100) / 100;
    render() {
        return (
            <div className='main-content cart-content'>
                <h1 className='cart-title'>Cart</h1>
                {this.state.cartItems.map((item, index) =>
                    <div className="row" key={index}>
                        <div className="col">
                            <div className='cart-item' >
                                <h3>{item.brand}</h3>
                                <h3>{item.name}</h3>
                                <p className='cart-item-price'>{this.showCurrencyForProduct(item)}</p>
                                <div className='cart-attributes'>
                                    {item.attributes.map((attribute, index) =>
                                        <div className='product-attribute' key={index} data-attribute-type={attribute.type} data-attribute-name={attribute.name}>
                                            <p className='attribute-name' key={index}>{attribute.name.toUpperCase() + ":"}</p>
                                            <ul className='attribute-values' data-type={attribute.type}>
                                                {this.renderAttributeValues(attribute)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                        <div className="col">
                            <div className='quantity-selector'>
                                <div className='adjust-quantity' onClick={(ev) => this.handleProductQuantity(ev, item, "increment")}>+</div>
                                <div className='quantity-amount'>{item.quantity}</div>
                                <div className='adjust-quantity' onClick={(ev) => this.handleProductQuantity(ev, item, "decrement")}>-</div>
                            </div>
                            <div className="image-display">
                                <img src={item.gallery[item.selectedGalleryIndex]} alt="Cart selected gallery item" />
                                {item.gallery.length > 1 ? <div className='cart-image-controls'>
                                    <div className="previous-image" onClick={(ev) => this.handleGalleryImageChange(ev, item)}>{"<"}</div>
                                    <div className="next-image" onClick={(ev) => this.handleGalleryImageChange(ev, item)}>{">"}</div>
                                </div> : ""}

                            </div>

                        </div>
                    </div>
                )}
                <div className='add-to-cart-wrapper'>
                    <p>Tax 21%: <span>{this.getTaxValue()}</span></p>
                    <p><>Quantity: <span>{this.state.quantity}</span></></p>
                    <p>Total: <span>{this.props.currency.symbol + this.twoDecimalTrunc(this.state.total)}</span></p>
                    <button className='add-to-cart-button'>ORDER</button>
                </div>
            </div>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        cart: state.cartReducer.cart,
        currency: state.currencyReducer.currency
    };
};
const mapDispatchToProps = {
    ADD_TO_CART,
    REMOVE_FROM_CART
};
export default connect(mapStateToProps, mapDispatchToProps)(CartView);
