import { Contract } from '@algorandfoundation/tealscript';

/**
 * Digital Marketplace contract class
 */
export class DigitalMarketplace extends Contract {
  // The ID of the asset that we are selling
  assetId = GlobalStateKey<AssetID>();

  // The cost of buying one unit of the asset
  unitaryPrice = GlobalStateKey<uint64>();

  /**
   * Creating a new application
   *
   * @param assetId The ID of the asset that we are selling
   * @param unitaryPrice The cost of buying one unit of the asset
   */
  createApplication(assetId: AssetID, unitaryPrice: uint64): void {
    // Allow user to set assetId and unitaryPrice
    this.assetId.value = assetId;
    this.unitaryPrice.value = unitaryPrice;
  }

  /**
   * Setting the new unitary price of the asset
   */
  setPrice(unitaryPrice: uint64) {
    assert(this.txn.sender === this.app.creator);
    this.unitaryPrice.value = unitaryPrice;
  }

  /**
   * Opt the contract address into the asset
   * i.e this is like importing a token / asset into your wallet
   *
   * @param mbrTxn The payment transaction that pays for the opt-in
   */
  optInToAsset(mbrTxn: PayTxn) {
    assert(this.txn.sender === this.app.creator);

    verifyPayTxn(mbrTxn, {
      receiver: this.app.address,
      amount: globals.minBalance + globals.assetOptInMinBalance,
    });

    sendAssetTransfer({
      xferAsset: this.assetId.value,
      assetAmount: 0,
      assetReceiver: this.app.address,
    });
  }

  /**
   *  Buying an asset
   *
   * @param buyerTxn The payment transaction that pays for the asset
   * @param quantity The quantity of the asset to buy
   */
  buyAsset(buyerTxn: PayTxn, quantity: uint64) {
    assert(this.assetId.value.id !== 0, 'Asset ID is not set');
    assert(this.unitaryPrice.value !== 0, 'Unitary price is not set');

    verifyPayTxn(buyerTxn, {
      sender: this.txn.sender,
      receiver: this.app.address,
      amount: this.unitaryPrice.value * quantity,
    });

    sendAssetTransfer({
      xferAsset: this.assetId.value,
      assetAmount: quantity,
      assetReceiver: this.txn.sender,
    });
  }

  /**
   * Method to delete the application
   * This will delete the application and transfer all assets to the creator
   */
  deleteApplication(): void {
    assert(this.txn.sender === this.app.creator);

    sendAssetTransfer({
      xferAsset: this.assetId.value,
      assetReceiver: this.app.creator,
      assetAmount: this.app.address.assetBalance(this.assetId.value),
      assetCloseTo: this.app.creator,
    });

    sendPayment({
      receiver: this.app.creator,
      amount: this.app.address.balance,
      closeRemainderTo: this.app.creator,
    });
  }
}
