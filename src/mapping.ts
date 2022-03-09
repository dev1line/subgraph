import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  S_EvenOdd,
  Bet,
  DiceRolled,
  OwnershipTransferred,
  Withdraw,
} from "../generated/S_EvenOdd/S_EvenOdd";
import { PlayerInfo, RollRound, BetInfo } from "../generated/schema";

export function handleBet(event: Bet): void {
  let contract = S_EvenOdd.bind(event.address);
  let RoundEntity = RollRound.load(event.transaction.from.toHex());
  if (!RoundEntity) {
    RoundEntity = new RollRound(event.transaction.from.toHex());
    RoundEntity.dealerBalance = BigInt.fromI32(0);
    RoundEntity.totalAmountPerRoll = BigInt.fromI32(0);
  }
  RoundEntity.rollId = event.params.rollId;

  RoundEntity.totalAmountPerRoll = contract.totalBetAmountPerRoll();
  RoundEntity.dealerBalance = contract.getDealerBalance();
  // RoundEntity.players = ``
  RoundEntity.save();

  let playerEntity = PlayerInfo.load(event.transaction.from.toHex());
  if (!playerEntity) {
    playerEntity = new PlayerInfo(event.transaction.from.toHex());
    playerEntity.lastRollId = BigInt.fromI32(1);
    playerEntity.count = BigInt.fromI32(0);
    playerEntity.totalBetAmount = BigInt.fromI32(0);
    playerEntity.address = Bytes.empty();
  }
  playerEntity.count = playerEntity.count.plus(BigInt.fromI32(1));
  playerEntity.lastRollId = event.params.rollId;
  playerEntity.address = event.params.player;
  playerEntity.totalBetAmount = playerEntity.totalBetAmount.plus(
    event.params.amount
  );
  playerEntity.save();

  let BetEntity = BetInfo.load(event.transaction.from.toHex()) as BetInfo;
  if (!BetEntity) {
    BetEntity = new BetInfo(event.transaction.from.toHex());
    BetEntity.betIsEven = true;
    BetEntity.amount = BigInt.fromI32(0);
  }
  BetEntity.betIsEven = event.params.isEven;
  BetEntity.amount = event.params.amount;
  // let clone = { ...BetEntity, player: playerEntity, round: RoundEntity };
  BetEntity.player = playerEntity;
  BetEntity.round = RoundEntity;
  BetEntity.save();

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.

  // It is also possible to access smart contracts from mappings. For
  // example, the contract that has emitted the event can be connected to
  // with:
  //

  //
  // The following functions can then be called on this contract to access
  // state variables and other data:
  //
  // - contract._cash(...)
  // - contract._ticket(...)
  // - contract.getBetAmountOf(...)
  // - contract.getDealerBalance(...)
  // - contract.getPlayerInfo(...)
  // - contract.isAlreadyBet(...)
  // - contract.owner(...)
  // - contract.players(...)
  // - contract.playersArray(...)
  // - contract.rollId(...)
  // - contract.totalBetAmount(...)
  // - contract.totalBetAmountPerRoll(...)
}

export function handleDiceRolled(event: DiceRolled): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleWithdraw(event: Withdraw): void {}
