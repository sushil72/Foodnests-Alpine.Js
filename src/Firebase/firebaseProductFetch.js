// Initialize Firebase if not already done
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

export default function fetchFoods() {
  return {
    foods: [],
    loading: false, // New property for the loader state
    async fetchProducts() {
      this.loading = true;
      try {
        // Access the store
        const myStore = Alpine.store("applicationStore");

        // Your Firebase configuration
        const firebaseConfig = myStore().firebaseConfig;        
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        const querySnapshot = await getDocs(collection(db, "products"));
        // Create an empty array to store products with vendor details
        const productsWithVendors = [];

        for (const docSnapshot of querySnapshot.docs) {
          const product = docSnapshot.data();

          // Assuming the product has a vendor_id field that references the vendor document
          const vendorRef = doc(db, "vendors", product.vendor_id); // Replace 'vendor_id' with the actual field in your product collection
          const vendorSnapshot = await getDoc(vendorRef);

          // Get vendor name, or default to 'Unknown Vendor' if no vendor is found
          const vendorName = vendorSnapshot.exists()
            ? vendorSnapshot.data().name
            : "Unknown Vendor";

          // Add the product with the vendor name to the productsWithVendors array
          productsWithVendors.push({
            id: docSnapshot.id,
            item: product.name,
            vendor: vendorName, // Add vendor name here
            price: product.price,
            img: product.image_url,
            description: product.description,
            category: product.category,
          });
        }

        // Assign the combined data to the foods array
        this.foods = productsWithVendors;
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        this.loading = false; // Stop the loader
      }
    },
  };
}
