# Product Requirements Document (PRD): CU Marketplace & Barter System

## 1. Project Overview
A dedicated digital marketplace for students of Chandigarh University (CU) to buy, sell, and barter second-hand items. The platform aims to facilitate affordable resource sharing within the campus community while ensuring safety and convenience.

## 2. Objectives
- Provide a secure platform for CU students to exchange items.
- Implement a **Barter System** to allow trading without cash.
- Reduce waste by promoting the reuse of textbooks, lab equipment, and electronics.
- Foster a sense of community among students.

## 3. Target Audience
- **Primary**: Undergraduate and Postgraduate students of Chandigarh University.
- **Secondary**: Faculty and staff living on campus or nearby.

## 4. Key Features

### 4.1. User Authentication
- **CU Email Verification**: Only users with `@cuchd.in` emails can register.
- **Profile Management**: Profile picture, department, hostel/locality, and contact preferences.

### 4.2. Marketplace (Buy & Sell)
- **Listing Creation**: Upload photos (up to 5), title, description, price, and category.
- **Categories**: Textbooks, Lab Coats/Equipment, Electronics, Fashion, Hostel Essentials (kettles, etc.), and Miscellaneous.
- **Search & Filter**: Search by keyword; filter by category, price range, and "Condition" (New, Like New, Used).

### 4.3. Barter System
- **Trade Request**: Users can offer an item from their own listings in exchange for another user's item.
- **Trade Management**: Accept, decline, or counter-offer trade requests.
- **Hybrid Trade**: Option to offer "Item + Cash" for a trade.

### 4.4. Communication & Safety
- **In-App Chat**: Real-time messaging between buyer and seller to discuss details and meeting points.
- **Meeting Points**: Pre-defined campus locations (Academic Block A1, Library, North/South Campus Hostels) to ensure safe exchanges.
- **Report System**: Flag inappropriate listings or fraudulent users.

### 4.5. Student-Specific Features
- **Hostel-to-Hostel Trading**: Priority tag for items available in the same hostel block.
- **Semester End Sales**: Featured sections for students leaving campus or moving to new semesters.

## 5. User Stories
1. **As a student**, I want to sell my old Engineering textbooks so that I can afford new ones for the next semester.
2. **As a hosteller**, I want to barter my electric kettle for a study lamp without spending any money.
3. **As a junior**, I want to buy a second-hand lab coat at a discounted price from a senior.

## 6. Technical Requirements
- **Frontend**: React.js with Vite for a fast UI.
- **Styling**: Tailwind CSS for rapid styling and responsive design.
- **Backend/Database**: Supabase for Authentication, Database (PostgreSQL), and Storage.
- **Real-time**: Supabase Realtime for chat notifications.
- **Hosting**: Vercel or Netlify.

## 7. Success Metrics
- Number of active users (registered with CU email).
- Volume of successful transactions (Buy/Sell and Barter).
- Item variety across all categories.
- User retention and average daily active users.
