import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin, from, map, Observable, switchMap } from 'rxjs';
import { RentalService } from 'src/app/services/rental.service';

import { RentingDialogComponent } from '../renting-dialog/renting-dialog.component';
import { NFT } from './../../models/wallet.model';
import { NftService } from './../../services/nft.service';
import { WalletService } from './../../services/wallet.service';

@Component({
  selector: 'app-renting',
  templateUrl: './renting.component.html',
  styleUrls: ['./renting.component.scss']
})
export class RentingComponent {
  public nfts$: Observable<NFT[]> = this.nftService.loadAccountNfts().pipe(
    switchMap(next => this.displayNFT(next))
  );

  constructor(
    private readonly nftService: NftService,
    private readonly dialogService: MatDialog,
    private readonly walletService: WalletService,
    private readonly rentalService: RentalService
  ) { }

  public rentClicked(nft: NFT): void {
    this.openRentingDialog(nft);
  }

  private openRentingDialog(nft: NFT): void {
    const dialogRef = this.dialogService.open(RentingDialogComponent, {
      width: '800px',
      data: nft,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("afterClose");
    });
  }

  public displayNFT(nfts: NFT[]): Observable<NFT[]> {
    const observables = nfts.map(nft =>
      from(this.rentalService.getOrder(nft.tokenAddress, nft.tokenId)));
    return forkJoin(observables).pipe(
      map(orders => orders.filter(order => order.renter !== this.walletService.account)),
      map(orders => nfts.filter(nft => {
        const orderIds = orders.map(order => `${order.nftAddress.toLocaleLowerCase()}:${order.nftId}`);
        return orderIds.includes(`${nft.tokenAddress.toLocaleLowerCase()}:${nft.tokenId}`);
      }))
    );
  }

}
