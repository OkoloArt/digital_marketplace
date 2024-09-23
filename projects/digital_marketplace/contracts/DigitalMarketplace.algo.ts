import { Contract } from '@algorandfoundation/tealscript';

export class DigitalMarketplace extends Contract {
  // The ID of the asset that we are selling
  assetId = GlobalStateKey<AssetID>();

  // The cost of buying one unit of the asset
  unitaryPrice = GlobalStateKey<uint64>();
}
