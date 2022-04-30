import React, { Component } from 'react';
import tcbLogo from '../tcb-logo.png';
import './App.css';
import Web3 from 'web3';
import Token1 from '../abis/TCB20.json'
import HDWalletProvider from '@truffle/hdwallet-provider'
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
toast.configure()

const privateKeys = [
  "77261323c54c837123113586be258008d2d002d0ea3cfc336462d4c4a0473082",
  "a95854fd97ac04c2ce728c901e4b1af337d50d3456f1b459f712d05d5ca2d972"
]

class App extends Component {
  async componentWillMount() {
    console.log("componentWillMount called")
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    console.log("loadWeb3 called")
    let provider = new HDWalletProvider(privateKeys, "http://localhost:7545")
    window.web3 = new Web3(provider)
  }

  async loadBlockchainData() {
    console.log("loadBlockchainData called")
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    console.log("list account: ", accounts)
    this.setState({ account: accounts[0] })

    const token1Address = "0xe10DfdcB8035EA42329c6a3979970FF0a209Ef73" 
    let token1 = new web3.eth.Contract(Token1.abi, token1Address)
    let balance = await token1.methods.balanceOf(this.state.account).call()
    let transactions = await token1.getPastEvents('Transfer', { fromBlock: 0, toBlock: 'latest', filter: { from: this.state.account } })
    if (balance == null){
      balance = 0
    }
    this.setState({ 
      token1: token1, 
      balance: web3.utils.fromWei(balance.toString(), 'Ether') ,
      transactions: transactions 
    })
  }

  async updateUI(){
    const balance = await this.state.token1.methods.balanceOf(this.state.account).call()
    const transactions = await this.state.token1.getPastEvents('Transfer', { fromBlock: 0, toBlock: 'latest', filter: { from: this.state.account } })

    console.log("balance after transfer: ", balance)
    this.setState({ 
      balance: window.web3.utils.fromWei(balance.toString(), 'Ether') , 
      transactions: transactions 
    })
  }

  async transfer(recipient, amount){
    console.log("transfer called")
    let tx = await this.state.token1.methods.transfer(recipient, amount).send({ from: this.state.account })
    console.log("transaction info: ", tx)
    if (tx.status == true){
      toast.success('transaction comfirmed')
      await this.updateUI()
    }else{
      toast.error('transaction error')
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      token1: null,
      balance: 0,
      transactions: []
    }

    this.transfer = this.transfer.bind(this)
  }

  render() {
    console.log("render called")
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0 text-light"
            target="_blank"
            rel="noopener noreferrer"
          >
            Dapp Techcom Securities
          </a>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto" style={{ width: "500px" }}>
                <a target="_blank" rel="noopener noreferrer">
                  <img src={tcbLogo} width="150" />
                </a>
                <h1>{this.state.balance} TCB1</h1>
                <form onSubmit={async (event) => {
                  event.preventDefault()
                  const recipient = this.recipient.value
                  const amount = window.web3.utils.toWei(this.amount.value, 'Ether')
                  this.transfer(recipient, amount)
                  toast.info('proccessing transaction')
                }}>
                  <div className="form-group mr-sm-2">
                    <input
                      id="recipient"
                      type="text"
                      ref={(input) => { this.recipient = input }}
                      className="form-control"
                      placeholder="Recipient Address"
                      required />
                  </div>
                  <div className="form-group mr-sm-2">
                    <input
                      id="amount"
                      type="text"
                      ref={(input) => { this.amount = input }}
                      className="form-control"
                      placeholder="Amount"
                      required />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">Send</button>
                </form>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">Recipient</th>
                      <th scope="col">value</th>
                    </tr>
                  </thead>
                  <tbody>
                    { this.state.transactions.map((tx, key) => {
                      return (
                        <tr key={key} >
                          <td>{tx.returnValues.to}</td>
                          <td>{window.web3.utils.fromWei(tx.returnValues.value.toString(), 'Ether')}</td>
                        </tr>
                      )
                    }) }
                  </tbody>
                </table>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
