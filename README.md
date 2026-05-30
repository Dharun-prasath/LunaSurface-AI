# LunaSurface-AI

<img src="./moon.jpg">

# 🌕 LunaSurface AI
### Lunar Surface Crater Segmentation Using Self-Supervised Learning

[![PyTorch](https://img.shields.io/badge/PyTorch-Framework-EE4C2C?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-Academic%20Research-blue)](LICENSE)

> *Self-Supervised Learning for Intelligent Lunar Crater Segmentation and Analysis* 🚀

---

## 📖 Overview

**LunaSurface AI** is a deep learning framework designed for automatic lunar crater segmentation and analysis using **Self-Supervised Learning (SSL)**. The system learns meaningful terrain representations from large collections of unlabeled lunar images through masked image reconstruction, and then fine-tunes the pretrained encoder for crater segmentation using a smaller labeled dataset.

This approach **reduces dependency on expensive manual annotations** while maintaining effective crater detection performance.

---

## 🚀 Features

- ✅ **Self-Supervised Learning (SSL) Pretraining**
- ✅ **Masked Image Reconstruction**
- ✅ **Multi-Scale Feature Fusion Architecture**
- ✅ **Lunar Crater Segmentation**
- ✅ **Crater Detection and Counting**
- ✅ **Support for Limited Labeled Data**
- ✅ **Automated Lunar Terrain Analysis**
- ✅ **FastAPI Backend Integration**
- ✅ **React Frontend Dashboard**
- ✅ **Visualization of Segmentation Outputs**

---

## 🏗️ System Architecture

The framework consists of **two major stages**:

### Stage 1 — Self-Supervised Pretraining

```
Input: Unlabeled Lunar Images
        ↓
Block Masking (40%)
        ↓
Encoder-Decoder Reconstruction Network
        ↓
MSE Reconstruction Loss
        ↓
Trained Encoder Saved for Fine-Tuning
```

### Stage 2 — Segmentation Fine-Tuning

```
Pretrained Encoder Loaded
        ↓
Multi-Scale Feature Fusion
        ↓
Segmentation Head
        ↓
Crater Mask Prediction
        ↓
Dice + Cross Entropy Loss
```

---

## 📂 Dataset Preparation

### Raw Dataset

The dataset consists of high-resolution lunar surface imagery collected from publicly available lunar remote sensing sources.

### Processing Pipeline

```
Raw Lunar Images
      ↓
Patch Extraction → Data Cleaning
      ↓
SSL Dataset Creation → Manual Annotation
      ↓
Preprocessing → Train-Validation Split
```

### Configuration

| Parameter | Value |
|-----------|-------|
| Image Size | 512 × 512 |
| Patch Size | 512 × 512 |
| Channels | Grayscale |
| Train Split | 80% |
| Validation Split | 20% |
| Mask Ratio | 40% |
| Block Size | 64 × 64 |

---

## 🧠 Proposed Methodology

### Self-Supervised Learning

The model learns crater and terrain representations **without labels** by reconstructing masked regions of lunar images.

### Multi-Scale Feature Fusion

Feature maps extracted at multiple encoder stages are combined to improve segmentation performance.

| Feature | Resolution | Purpose |
|---------|------------|---------|
| C1 | 256 × 256 × 32 | Fine spatial details |
| C2 | 128 × 128 × 64 | Terrain patterns |
| C3 | 128 × 128 × 128 | Deep crater features |

---

## ⚙️ Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js |
| Backend | FastAPI |
| AI Framework | PyTorch |
| Visualization | Matplotlib, OpenCV |
| Dataset Management | NumPy, Pandas |

---

## 📊 Experimental Results

| Metric | Score |
|--------|-------|
| mIoU | 51.03% |
| Dice Score | 67.10% |
| Precision | 68.76% |
| Recall | 68.93% |
| F1 Score | 67.10% |
| Specificity | 94.02% |
| Count Error | 40.29 Craters |

---

## 📈 Results Summary

The proposed SSL-based framework successfully:

- 🔵 Detects lunar craters of various sizes
- 🔵 Generates accurate segmentation masks
- 🔵 Reduces dependency on large labeled datasets
- 🔵 Learns robust terrain representations
- 🔵 Supports crater counting and analysis

---

## 🎯 Applications

- 🌑 Lunar Surface Mapping
- 🪐 Planetary Terrain Analysis
- 🛬 Autonomous Landing Systems
- ⚠️ Hazard Detection
- 🚀 Space Exploration Missions
- 📐 Crater Statistics and Research

---

## 🔮 Future Work

- [ ] Multi-Class Lunar Terrain Segmentation
- [ ] Boulder Detection
- [ ] Highland and Mare Classification
- [ ] Landing Zone Hazard Assessment
- [ ] Real-Time Onboard AI Systems
- [ ] Mars Surface Adaptation

---

## 👨‍💻 Authors

**Dharun Prasath M**
Department of Computer Science and Engineering
SRM Institute of Science and Technology, Tiruchirappalli

**Tamilrathan T**
Department of Computer Science and Engineering
SRM Institute of Science and Technology, Tiruchirappalli

### Supervisor

**Dr. S. Rahmath Nisha**, B.E., M.Tech., Ph.D.
Assistant Professor, Department of Computer Science and Engineering
SRM Institute of Science and Technology, Tiruchirappalli

---

## 📜 License

This project is developed for **academic and research purposes** under the Major Project course requirements at SRM Institute of Science and Technology.

---

<p align="center">
  🌕 <strong>LunaSurface AI</strong> — Self-Supervised Learning for Intelligent Lunar Crater Segmentation and Analysis 🚀
</p>
