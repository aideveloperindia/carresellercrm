# Car Reseller CRM - Structure Explanation

## Page Distinctions & Usage

### 1. **BUYERS** 👥
**What it is:** Your customer database - people who want to BUY cars

**What you store:**
- Contact info (name, phone, email, address)
- Car preferences (what they're looking for: brand, model, year, price range, color, fuel type, etc.)
- Visit count, notes

**When to use:**
- Someone calls/walks in wanting to buy a car → Add to Buyers
- Track all potential customers in one place
- See what cars each buyer is interested in

**Example:** "John wants a Toyota Camry under ₹15 lakhs"

---

### 2. **SELLERS** 🏢
**What it is:** Your supplier database - people who want to SELL cars

**What you store:**
- Contact info (name, phone, email, address)
- Car details (what they're selling: brand, model, year, price, color, fuel type, etc.)
- Notes

**When to use:**
- Someone wants to sell their car → Add to Sellers
- Track all car suppliers/partners
- See what cars each seller is offering

**Example:** "Sarah is selling a Honda Civic 2019 for ₹12 lakhs"

---

### 3. **CARS** 🚗
**What it is:** Your inventory - actual cars in stock

**What you store:**
- Full car details (brand, model, year, price, status, color, fuel, transmission, mileage, VIN, registration)
- Status: Available, Sold, Reserved, Maintenance
- Price history

**When to use:**
- When you acquire a car (from a seller or elsewhere) → Add to Cars
- Manage your inventory
- Track which cars are available/sold

**Example:** "Toyota Camry 2020 - ₹14.5 lakhs - Available"

---

### 4. **LEADS** 📋
**What it is:** Sales opportunities - tracks the sales process

**What you store:**
- Links a Buyer to a specific Car
- Status: New → Contacted → Qualified → Converted → Lost
- Source (where they came from: website, referral, walk-in)
- Tags, notes, visit count

**When to use:**
- When a Buyer shows interest in a specific Car → Create a Lead
- Track the sales funnel for each opportunity
- See which leads are hot, which are cold
- Convert successful leads (mark as "Converted" when sale happens)

**Example:** "Lead: John (Buyer) interested in Toyota Camry (Car) - Status: Qualified"

**The Key Difference:**
- **Buyers/Sellers** = People (contacts)
- **Cars** = Inventory (products)
- **Leads** = Opportunities (sales pipeline connecting people to products)

---

### 5. **FOLLOW-UPS** 📞
**What it is:** Scheduled tasks/reminders

**What you store:**
- Type: call, visit, test-drive, payment, etc.
- Scheduled date/time
- Links to Lead, Buyer, Seller, or Car
- Completed status

**When to use:**
- Schedule a follow-up call with a buyer
- Remind yourself to check on a seller
- Schedule test drives
- Track payment follow-ups

**Example:** "Follow-up: Call John tomorrow about Toyota Camry test drive"

---

## Typical Workflow

### Scenario 1: Someone wants to BUY
1. **Buyers** → Add new buyer with their car preferences
2. **Cars** → Check if you have matching cars in inventory
3. **Leads** → Create lead linking buyer to car (if match found)
4. **Follow-ups** → Schedule calls/visits/test-drives
5. **Leads** → Update status as you progress (New → Contacted → Qualified)
6. **Leads** → Mark as "Converted" when sale happens
7. **Cars** → Update car status to "Sold"

### Scenario 2: Someone wants to SELL
1. **Sellers** → Add new seller with car details they're offering
2. **Cars** → If you buy the car, add it to your inventory
3. **Cars** → Link car to seller (optional, for tracking)

### Scenario 3: Walk-in Customer
1. **Buyers** → Add buyer (if new customer)
2. **Cars** → Show them available cars
3. **Leads** → Create lead for each car they show interest in
4. **Follow-ups** → Schedule test drive or follow-up call

---

## Why Have Separate Pages?

**Buyers & Sellers are CONTACTS** (people database)
- You might have 100 buyers, 50 sellers
- These are your relationships/contacts

**Cars are INVENTORY** (product database)
- You might have 20 cars in stock
- These are your products

**Leads are OPPORTUNITIES** (sales pipeline)
- You might have 30 active leads (buyers interested in specific cars)
- These track the sales process
- One buyer can have multiple leads (interested in multiple cars)
- One car can have multiple leads (multiple buyers interested)

**Follow-ups are TASKS** (action items)
- Reminders to call, visit, follow up
- Keeps you organized

---

## Simplified View

Think of it like this:
- **Buyers** = Your customer list 📇
- **Sellers** = Your supplier list 📇
- **Cars** = Your showroom inventory 🚗
- **Leads** = Your sales pipeline 📊
- **Follow-ups** = Your to-do list ✅

---

## Recommendation

The **Leads** page is most useful when:
- You have multiple buyers interested in the same car
- You want to track which opportunities are hot vs cold
- You want to see your conversion rate
- You want to prioritize which buyers to follow up with

If you have a simple operation, you could:
- Just use Buyers + Cars
- Track status in notes or a simple field
- Skip the Leads page

But for a proper CRM, Leads help you:
- See your sales funnel
- Track conversion rates
- Prioritize hot leads
- Analyze which sources bring best leads




