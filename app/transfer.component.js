"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var router_1 = require('@angular/router');
var asset_service_1 = require('./asset.service');
var user_service_1 = require('./user.service');
var TransferComponent = (function () {
    function TransferComponent(router, assetService, userService) {
        this.router = router;
        this.assetService = assetService;
        this.userService = userService;
        this.assets = [];
        this.selectedAsset = '';
        this.assetBalance = 0;
        this.counterparties = [];
        this.counterpartyNames = [];
        this.selectedCounterparty = '';
        this.amountToTransfer = 0;
    }
    TransferComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.assetService.getListOfAssets()
            .subscribe(function (data) {
            _this.assets = [];
            for (var index in data) {
                _this.assets.push(data[index]["contractName"]);
            }
        }, function (err) { console.log('err:', err); });
        this.userService.getListOfUsers()
            .subscribe(function (data) {
            _this.counterparties = [];
            _this.counterpartyNames = [];
            for (var index in data) {
                _this.counterparties.push(data[index]);
                _this.counterpartyNames.push(data[index]["name"]);
            }
        }, function (err) { console.log('err:', err); });
    };
    TransferComponent.prototype.assetOnSelect = function (e) {
        var _this = this;
        console.log('Selected value:', e.value);
        this.userService.getUser()
            .then(function (user) {
            _this.assetService.getAssetBalance(e.value, user.address)
                .subscribe(function (data) {
                console.log('balance Data:', data);
                _this.assetBalance = data["balance"];
            }, function (err) { console.log('err:', err); });
        });
    };
    TransferComponent.prototype.counterpartyOnSelect = function (e) {
        var userIndex = this.counterparties.map(function (x) { return x.name; }).indexOf(e.value);
        this.toUser = this.counterparties[userIndex];
    };
    TransferComponent.prototype.transferAsset = function () {
        var _this = this;
        this.errMsg = "";
        this.userService.getUser()
            .then(function (user) {
            if (!user || user.isLoggedIn == false) {
                _this.errMsg = "You have been logged out, please login again";
                return;
            }
            if (!_this.selectedAsset || _this.selectedAsset == '') {
                _this.errMsg = "Please select a valid asset";
                return;
            }
            else {
                var assetIndex = _this.assets.map(function (x) { return x; }).indexOf(_this.selectedAsset);
                if (assetIndex == -1) {
                    _this.errMsg = "Please select a valid asset";
                    return;
                }
            }
            if (!_this.toUser) {
                _this.errMsg = "Please select a valid counterparty to do the transaction with";
                return;
            }
            if (!_this.amountToTransfer || _this.amountToTransfer == 0) {
                _this.errMsg = "Please select a valid amount to transfer";
                return;
            }
            _this.msg = "transferring assets to " + _this.toUser.name;
            _this.assetService.transferAsset(_this.selectedAsset, _this.amountToTransfer, user.address, user.password, _this.toUser.address)
                .subscribe(function (data) {
                if (data["err"] && data["err"] != '') {
                    console.log('An error occured: ', data["err"]);
                    _this.errMsg = data["err"];
                }
                else {
                    console.log(data);
                    _this.msg = "Transfer sent to blockchain.  TxId = " + data["txId"];
                    _this.selectedAsset = '';
                    _this.selectedCounterparty = '';
                    _this.toUser = null;
                    _this.amountToTransfer = 0;
                    _this.assetBalance = 0;
                }
            }, function (err) {
                console.log(err.Message);
                _this.errMsg = err.Message;
            });
        });
    };
    TransferComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'my-dashboard',
            templateUrl: 'transfer.component.html',
            styleUrls: ['transfer.component.css']
        }), 
        __metadata('design:paramtypes', [router_1.Router, asset_service_1.AssetService, user_service_1.UserService])
    ], TransferComponent);
    return TransferComponent;
}());
exports.TransferComponent = TransferComponent;
//# sourceMappingURL=transfer.component.js.map