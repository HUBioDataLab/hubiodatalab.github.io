---
title: "SELFormerMM Accepted as an ECCB 2026 Proceedings Paper"
author: research-news
tags:
  - drug discovery
  - representation learning
  - conference
---

Our study "SELFormerMM: Multimodal Molecular Representation Learning via SELFIES, Structure, Text, and Knowledge Graph Integration" has been accepted as a proceedings paper at ECCB 2026 and will be presented orally in Geneva. It will appear in *Bioinformatics* (Oxford University Press).

Before a model can predict a molecule's toxicity, solubility or blood–brain barrier penetration, it has to learn what the molecule is. Most models see molecules through a single view, such as a chemical string or a 2D graph. SELFormerMM brings four complementary views into one shared representation space:

* **Sequence:** SELFIES strings encoded with our transformer model [SELFormer](https://iopscience.iop.org/article/10.1088/2632-2153/acdb30/);
* **Structure:** molecular graph embeddings from Uni-Mol;
* **Text:** natural-language molecule descriptions encoded with SciBERT;
* **Knowledge graph:** interaction embeddings from our [CROssBARv2](https://crossbarv2.hubiodatalab.com/) knowledge graph.

The modalities are aligned with modality-specific projection networks and a multi-view contrastive objective, and the model (246M parameters) is pre-trained on about 3 million molecules. It is built to tolerate missing modalities.

On MoleculeNet, SELFormerMM ranks best overall on SIDER (adverse drug reactions, ROC-AUC 0.749), second on BBBP (0.918), and is the best multimodal model on lipophilicity. It also improves over its unimodal version on PDBbind binding affinity and HIV.

First author Erva Ulusoy led the implementation and analysis, with contributions from Şevval B. and Bora Engin Deniz on model development and benchmarking.

**Links**

* Preprint: [bioRxiv](https://www.biorxiv.org/content/10.64898/2026.03.17.712340v1)
* Code: [GitHub](https://github.com/HUBioDataLab/SELFormerMM)
