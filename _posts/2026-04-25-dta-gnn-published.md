---
title: "DTA-GNN: An Open-Source Toolkit for Leakage-Aware Drug–Target Affinity Prediction"
author: research-news
tags:
  - drug discovery
  - graph neural networks
  - software
---

DTA-GNN, an end-to-end open-source Python toolkit for drug–target affinity (DTA) prediction with graph neural networks, has been published in *SoftwareX*.

Much DTA research suffers from data leakage and non-reproducible preprocessing: when training and test sets share molecular scaffolds, models learn familiar chemical patterns instead of generalising to new compounds. DTA-GNN addresses this with:

* leakage-aware, target-specific dataset construction directly from ChEMBL, with scaffold-based ("cold-drug") and temporal splits and automated leakage audits;
* 10 GNN architectures (including GIN, GAT, GraphSAGE, PNA and graph transformers) alongside classical baselines, under one configurable training interface;
* Bayesian hyperparameter optimisation and experiment tracking with Weights & Biases;
* latent-space analysis and interactive visualisation of learned molecular embeddings;
* a Python API, a command-line interface and a no-code Gradio web app, available on Hugging Face Spaces and SciLifeLab Serve.

The work was led by our alumnus Gökhan Özsarı (Chalmers University of Technology / METU), with Ahmet Süreyya Rifaioğlu (Heidelberg University), Aybar C. Acar (METU), M. Volkan Atalay (Loyola University Chicago) and Tunca Doğan.

**Links**

* Paper: [SoftwareX](https://doi.org/10.1016/j.softx.2026.102671)
* Code: [GitHub](https://github.com/gozsari/DTA-GNN)
* Web app: [Hugging Face](https://huggingface.co/spaces/gozsari/dta-gnn)
