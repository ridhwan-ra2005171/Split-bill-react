import React, { useState } from "react";

const initialFriends = [
  {
    id: 118836,
    name: "Clark",
    image: "https://i.pravatar.cc/48?u=118836",
    balance: -7, //means you owe
  },
  {
    id: 933372,
    name: "Sarah",
    image: "https://i.pravatar.cc/48?u=933372",
    balance: 20, //means she owes
  },
  {
    id: 499476,
    name: "Anthony",
    image: "https://i.pravatar.cc/48?u=499476",
    balance: 0, //means they are even
  },
];

//button reusable
function Button({ children, onClick }) {
  return (
    <button className="button" onClick={onClick}>
      {children}
    </button>
  );
}

export default function App() {
  const [friends, setFriends] = useState(initialFriends);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [selectedFriend, setSelectedFiend] = useState(null);

  function handleAddFriend(friend) {
    setFriends((friends) => [...friends, friend]);
    setShowAddFriend(false); //when you add a friend, close the form
    //we alr also have the function to close the form in the button
  }

  //this will be passed to friendslist -> friend component
  function handleSelectFriend(friend) {
    console.log("handleSelectFriend clicked", friend);
    //toggling selecting and not selecting the person
    setSelectedFiend(selectedFriend === friend ? null : friend);
    setShowAddFriend(false); //to close the add friend form
  }

  //handling splitting the bill
  function handleSplitBill(value) {
    console.log(value); // negative means you owe
    setFriends((friends) =>
      friends.map((friend) =>
        friend.id === selectedFriend.id //check if selected
          ? { ...friend, balance: friend.balance + value }// add to balance (how much owe/owed)
          : friend //don't change other friends
      )
    );

    setSelectedFiend(null);//close the split bill form
  }

  return (
    <div className="app">
      <div className="sidebar">
        <FriendsList
          friends={friends}
          selectedFriend={selectedFriend}
          onSelection={handleSelectFriend}
        />
        {showAddFriend && <FormAddFriend onAddFriend={handleAddFriend} />}
        <Button onClick={() => setShowAddFriend(!showAddFriend)}>
          {showAddFriend ? "Close" : "Add Friend"}
        </Button>
      </div>
      {selectedFriend && (
        <FormSplitBill
          selectedFriend={selectedFriend}
          onSplitBill={handleSplitBill}
        />
      )}
    </div>
  );
}

function FriendsList({ friends, onSelection, selectedFriend }) {
  //   const friends = initialFriends; //hard coded

  return (
    <ul>
      {friends.map((friend) => (
        <Friend
          key={friend.id}
          friend={friend}
          selectedFriend={selectedFriend}
          onSelection={onSelection}
        />
      ))}
    </ul>
  );
}

function Friend({ friend, onSelection, selectedFriend }) {
  const isSelected = friend === selectedFriend;

  return (
    <li className={`friend ${isSelected ? "selected" : ""}`}>
      <div className="avatar">
        <img src={friend.image} alt={friend.name} />
      </div>
      <h2>{friend.name}</h2>
      <p
        className={
          friend.balance < 0 ? "red" : friend.balance > 0 ? "green" : "grey"
        }
      >
        {friend.balance < 0
          ? `You owe ${friend.name} ${Math.abs(friend.balance)}€`
          : friend.balance > 0
          ? `${friend.name} owes you ${friend.balance}€`
          : "You and " + friend.name + " are even"}
      </p>
      <Button onClick={() => onSelection(friend)}>
        {isSelected ? "Close" : "Select"}
      </Button>
    </li>
  );
}

function FormAddFriend({ onAddFriend }) {
  const [name, setName] = useState("");
  //default generates random avatar
  const [image, setImage] = useState("https://i.pravatar.cc/48");

  function handleSubmit(e) {
    e.preventDefault(); //to stop refreshing

    if (!name || !image) {
      return; //if not valid, do nothing
    }

    const id = crypto.randomUUID();
    const newFriend = {
      id,
      name,
      image: `${image}?id=${id}`,
      balance: 0,
    };

    onAddFriend(newFriend);

    //reset to default
    setName("");
    setImage("https://i.pravatar.cc/48");
  }

  return (
    <form className="form-add-friend" onSubmit={handleSubmit}>
      <label>👀Friend Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      ></input>
      <label>🎨 Image URL</label>
      <input
        type="text"
        value={image}
        onChange={(e) => setName(e.target.value)}
      ></input>

      <Button>Add</Button>
    </form>
  );
}

function FormSplitBill({ selectedFriend, onSplitBill }) {
  const [bill, setBill] = useState("");
  const [paidByUser, setPaidByUser] = useState("");
  const paidByFriend = bill ? bill - paidByUser : ""; //only calculate if there is a bill
  const [whoIsPaying, setWhoIsPaying] = useState("user");

  function handleSubmit(e) {
    e.preventDefault();
    console.log("submit clicked", bill, paidByUser, whoIsPaying);

    //if no bill or no paid by user, do nothing
    if (!bill || !paidByUser) {
      return;
    }

    //if paid by user, set paid by friend to 0
    onSplitBill(whoIsPaying === "user" ? paidByFriend : -paidByUser);
  }

  return (
    <form className="form-split-bill" onSubmit={handleSubmit}>
      <h2>Split a bill with {selectedFriend.name}</h2>

      <label>💰 Bill value</label>
      <input
        type="text"
        value={bill}
        onChange={(e) => setBill(Number(e.target.value))}
      ></input>

      {/* we want to make sure the expense doesnt go above the bill */}
      <label>🧍‍♀️ Your expense</label>
      <input
        type="text"
        value={paidByUser}
        onChange={(e) =>
          setPaidByUser(
            Number(e.target.value) > bill ? paidByUser : Number(e.target.value)
          )
        }
      ></input>

      <label>👫 {selectedFriend.name}'s expense</label>
      <input type="text" disabled value={paidByFriend}></input>

      <label>🤑 Who is paying the bill</label>
      <select
        value={whoIsPaying}
        onChange={(e) => setWhoIsPaying(e.target.value)}
      >
        <option value="user">You</option>
        <option value="your friend">{selectedFriend.name}</option>
      </select>

      <Button>Split Bill</Button>
    </form>
  );
}
