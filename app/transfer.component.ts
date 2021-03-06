import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TypeaheadModule } from 'ng2-bootstrap/ng2-bootstrap';
import { AssetService } from './asset.service';
import { UserService } from './user.service';

@Component({
  moduleId: module.id,
  selector: 'my-dashboard',
  templateUrl: 'transfer.component.html',
  styleUrls: [ 'transfer.component.css' ]
})

export class TransferComponent implements OnInit {

  private assets: Array<string> = [];
  private selectedAsset: string='';
	private assetBalance: number=0;
  private counterparties: Array<any> = [];
  private counterpartyNames: Array<string> = [];
  private selectedCounterparty: string='';
  private toUser: any;
  private amountToTransfer: number=0;
  private msg: string;
  private errMsg: string;

  constructor(
		private router: Router, 
		private assetService: AssetService,
		private userService: UserService) {  }

  ngOnInit(): void {
    this.assetService.getListOfAssets()
			.subscribe(
				data => {
					this.assets = [];
          for(var index in data){
            this.assets.push(data[index]["contractName"]);
          }
        },
				err => { console.log('err:', err); }
      );

    this.userService.getListOfUsers()
			.subscribe(
				data => {
					this.counterparties = [];
					this.counterpartyNames = [];
          for(var index in data){
            this.counterparties.push(data[index]);
            this.counterpartyNames.push(data[index]["name"]);
          }
        },
				err => { console.log('err:', err); }
      );
  }

  assetOnSelect(e: any) {
    console.log('Selected value:', e.value);
    this.userService.getUser()
      .then(user => {
				this.assetService.getAssetBalance(e.value, user.address)
					.subscribe(
						data => {
							console.log('balance Data:', data);
							this.assetBalance = data["balance"];
						},
						err => { console.log('err:', err); }
					);
		});
	}

  counterpartyOnSelect(e: any) {
		var userIndex = this.counterparties.map(function(x) {return x.name; }).indexOf(e.value);
		this.toUser = this.counterparties[userIndex];
	}

	transferAsset(): void {
    this.errMsg = "";
    this.userService.getUser()
      .then(user => {
        if(!user || user.isLoggedIn == false){
          this.errMsg = "You have been logged out, please login again";
          return;
        } 

        if(!this.selectedAsset || this.selectedAsset==''){
          this.errMsg = "Please select a valid asset";
          return;
        } else {
          var assetIndex = this.assets.map(function(x) {return x; }).indexOf(this.selectedAsset);
          if(assetIndex==-1){
            this.errMsg = "Please select a valid asset";
            return;
          }
        }

        if(!this.toUser){
          this.errMsg = "Please select a valid counterparty to do the transaction with";
          return;
        }

        if(!this.amountToTransfer || this.amountToTransfer == 0){
          this.errMsg = "Please select a valid amount to transfer";
          return;
        }

        this.msg = "transferring assets to " + this.toUser.name;
				this.assetService.transferAsset(this.selectedAsset, this.amountToTransfer, user.address, user.password, this.toUser.address) 
					.subscribe(
						data => {
							if(data["err"] && data["err"] != ''){
								console.log('An error occured: ', data["err"]);
                this.errMsg = data["err"];
							} else {
								console.log(data);
                this.msg = "Transfer sent to blockchain.  TxId = " + data["txId"];
                this.selectedAsset = '';
                this.selectedCounterparty = '';
                this.toUser = null;
                this.amountToTransfer = 0;
                this.assetBalance = 0;
							}
						},
						err => { 
              console.log(err.Message);
              this.errMsg = err.Message;
            }
		  		);
			});
  }
}

