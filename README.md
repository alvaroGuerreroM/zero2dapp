# Zero to Dapp Devconnect Argentina - $100 up for grabs!!!

This is the repo for Zero to Dapp, a workshop with seven sections:

1. Remix
2. [The Graph](https://github.com/ryestew/zero2dapp/blob/self/THEGRAPH.md)
3. [Celo](https://github.com/ryestew/zero2dapp/blob/self/CELO.md) 
4. [Chainlink](https://github.com/ryestew/zero2dapp/blob/self/Chainlink.md)
5. [ENS](https://github.com/ryestew/zero2dapp/blob/self/ENS.md)
6. [Uniswap](https://github.com/ryestew/zero2dapp/blob/self/UNISWAP.md)
7. [Self Protocol](https://github.com/ryestew/zero2dapp/blob/self/SELF.md)

Each section will have at least one branch. 

When there is just one branch for a section, it will contain the finished work.  When there are two branches, the first one is for starting point and the second is will contain the finished work for that section.


# Participant Quick Guide

Welcome! This is your fast-lane overview for navigating the workshops, building your project, and submitting it for the $100 prize.

---

## 1. Getting Started

### Fork the Repo

Click **Fork** → clone your fork:

```bash
git clone <your-fork-url>
cd <repo>
yarn install
```

---

## 2. How the Workshops Work

Each workshop session has a **final state branch** named after the protocol

```
- Remix (main)
- The Graph (the-graph) - get started branch
- The Graph (the-graph-solved) - get started branch
- Celo (celo)
- Chainlink (chainlink)
- ENS (ENS)
- Uniswap (UF)
- Self Protocol (Self)
```

You can start building from any branch depending on when you join. As the Remix workshop does not yet come with a ready project, we recommend starting off from `the-graph` branch!!

---

## ⏱️ 3. If You Join Late

* **Joined during first half of a session?**
  → Check out the **previous** session branch to follow the step-by-step build, except for The Graph workshop, there you should start with `the-graph` branch.

  ```bash
  git checkout <previous-protocol-name>
  ```

* **Joined during second half or later?**
  → Check out the **current** session’s final branch so you can jump right in.


  ```bash
  git checkout <current-protocol-name>
  ```

---

## 🛠️ 4. Build Your Project

Create a new branch in your fork:

```bash
git checkout -b my-project
```

Your goal:
**Integrate at least TWO workshop technologies** into a small project.
Even a tiny prototype is totally valid — we want everyone to submit.

---

## 📝 5. Submit & Qualify for the $100 Prize

1. Fill out this [form](https://docs.google.com/forms/d/e/1FAIpQLSe_X10BPJyEVwK-jzgd7gCou4kQx-GmPXlxccKCUBvqp1xW9g/viewform)
2. Submit a PR to the main branch (see instructions right below)!

All submissions go into a small PR to this repo:

1. Create your submission folder:

```bash
mkdir -p submissions/<your-github-handle>
```

2. Add a `SUBMISSION.md`:

```bash
touch submissions/<your-github-handle>/SUBMISSION.md
```

3. Fill in:

```
- Project name  
- Link to your Fork/ branch
- Workshops integrated  
- Feedback
```

4. Commit + push + open a Pull Request.

Once your PR is open → your project is officially submitted.

---

## Prize Criteria

To qualify:

* Submit before the deadline (6 PM, 20th of November, 2025)
* Your project must integrate **two or more** workshop topics
* Your project can not just be a fork of an existing project
* Provide a working repo + a clear short description

Winner will be randomly selected, so everyone has a chance!!!

---

## 💬 Need Help?

Ask any workshop lead — we’re here to support you throughout the day.
Have fun building! 🚀


