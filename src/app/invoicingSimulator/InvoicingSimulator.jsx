import './InvoicingSimulator.css';
import { Component } from 'react';
import { List } from '../../components/List';
import { Numeric } from '../../components/Numeric';
import { ProductFlavor } from './ProductFlavor';
import { ProductInstance } from './ProductInstance';
import { SelectedFlavor } from './SelectedFlavor';
import { productFlavorComparator, productInstanceComparator } from '../productInstance/productInstanceComparators';

/**
 * This component is a Clever Cloud Invoicing Simulator. It helps user to select some product flavors and see the cost
 * of his selection.
 */
export class InvoicingSimulator extends Component {
  state = {
    /**
     * The selected product instance.
     * @type {ProductInstanceModel|null}
     */
    selectedProductInstance: null,
    /**
     * The flavors the user added to its cart.
     * @type {Array<ProductFlavorModel>}
     */
    selectedFlavors: []
  };


  //-- state modifiers ------

  /**
   * @param {ProductInstanceModel} productInstance - the selected product instance
   */
  setSelectedProductInstance(productInstance) {
    this.setState({ selectedProductInstance: productInstance });
  }

  /**
   * @param {Array<ProductFlavorModel>} selectedFlavors - the selected flavors
   */
  setSelectedFlavors(selectedFlavors) {
    this.setState({ selectedFlavors: selectedFlavors.sort(productFlavorComparator) });
  }

  //-- Product Instances List ------

  productInstanceItemId = (productInstance) => {
    return productInstance.id;
  };

  onSelectProductInstance = (productInstance) => {
    this.setState({ selectedProductInstance: productInstance });
  };

  productInstanceRenderer = (productInstance) => {
    return <ProductInstance
      productInstance={productInstance}
      selected={this.state.selectedProductInstance === productInstance}
      onButtonClick={this.onSelectProductInstance.bind(this, productInstance)}
    />;
  };

  renderProductInstances() {
    return <List
      className="tp-invoicing-simulator-list tp-product-instances"
      itemId={this.productInstanceItemId}
      itemRenderer={this.productInstanceRenderer}
      items={this.props.productInstances.sort(productInstanceComparator)}
    />;
  }


  //-- Product Flavors List ------

  productFlavorItemId = (productFlavor) => {
    return `${productFlavor.instance.id}/${productFlavor.name}`;
  };

  onSelectProductFlavor = (productFlavor) => {
    this.setSelectedFlavors([...this.state.selectedFlavors, productFlavor]);
  };

  productFlavorRenderer = (productFlavor) => {
    return <ProductFlavor
      productFlavor={productFlavor}
      onButtonClick={this.onSelectProductFlavor.bind(this, productFlavor)}
    />;
  };

  renderProductFlavors() {
    const selectableFlavors = (this.state.selectedProductInstance?.flavors ?? [])
      .filter(f => !this.state.selectedFlavors.includes(f))
      .sort(productFlavorComparator);

    return <List
      className="tp-invoicing-simulator-list tp-product-flavors"
      itemId={this.productFlavorItemId}
      itemRenderer={this.productFlavorRenderer}
      items={selectableFlavors}
    />;
  }


  //-- Selected product flavors -------

  onUnselectProductFlavor = (productFlavor) => {
    this.setSelectedFlavors(this.state.selectedFlavors.filter(f => f !== productFlavor));
  };

  selectedFlavorRenderer = (productFlavor) => {
    return <SelectedFlavor
      productFlavor={productFlavor}
      onButtonClick={this.onUnselectProductFlavor.bind(this, productFlavor)}
    />;
  };

  renderSelectedFlavors() {
    return <List
      className="tp-invoicing-simulator-list tp-selected-flavors"
      itemId={this.productFlavorItemId}
      itemRenderer={this.selectedFlavorRenderer}
      items={this.state.selectedFlavors}
    />;
  }


  //-- Header ------

  renderHeader() {
    const totalPrice = this.state.selectedFlavors.map(f => f.price).reduce((a, b) => a + b, 0);

    return <div className="tp-invoicing-simulator-header">
      Total: <Numeric value={totalPrice} precision={2} unit="€"/>
    </div>;
  }


  //-- Main renderer ------

  render() {
    return <div className="tp-invoicing-simulator">
      {this.renderHeader()}
      {this.renderProductInstances()}
      {this.renderProductFlavors()}
      {this.renderSelectedFlavors()}
    </div>;
  }
}
