import { saveBanner, saveCategory, saveProduct, Banner, Category, Product, getBanners, getCategories, getProducts } from './storage';
import heroImage1 from '@/assets/hero-banner-1.jpg';
import heroImage2 from '@/assets/hero-banner-2.jpg';
import necklaceImage from '@/assets/category-necklaces.jpg';
import ringImage from '@/assets/category-rings.jpg';
import earringImage from '@/assets/category-earrings.jpg';
import braceletImage from '@/assets/category-bracelets.jpg';

export const seedInitialData = async () => {
  try {
    // Check if data already exists
    const existingBanners = await getBanners();
    const existingCategories = await getCategories();
    const existingProducts = await getProducts();
    
    if (existingBanners.length === 0) {
      const banners: Banner[] = [
        {
          id: '1',
          image: heroImage1,
          title: 'Exquisite Diamond Collection',
          description: 'Discover our finest selection of lab-grown and natural diamonds',
        },
        {
          id: '2',
          image: heroImage2,
          title: 'Timeless Elegance',
          description: 'Handcrafted jewelry that tells your unique story',
        },
      ];

      for (const banner of banners) {
        await saveBanner(banner);
      }
    }

    if (existingCategories.length === 0) {
      const categories: Category[] = [
        {
          id: '1',
          name: 'Necklaces',
          image: necklaceImage,
          description: 'Elegant necklaces for every occasion',
        },
        {
          id: '2',
          name: 'Rings',
          image: ringImage,
          description: 'Stunning rings that capture hearts',
        },
        {
          id: '3',
          name: 'Earrings',
          image: earringImage,
          description: 'Beautiful earrings to complement any look',
        },
        {
          id: '4',
          name: 'Bracelets',
          image: braceletImage,
          description: 'Sophisticated bracelets for refined taste',
        },
      ];

      for (const category of categories) {
        await saveCategory(category);
      }
    }

    if (existingProducts.length === 0) {
      const products: Product[] = [
        {
          id: '1',
          categoryId: '1',
          name: 'Diamond Solitaire Necklace',
          image: necklaceImage,
          description: 'A stunning solitaire diamond necklace perfect for any special occasion',
          price: '₹45,000',
        },
        {
          id: '2',
          categoryId: '2',
          name: 'Platinum Engagement Ring',
          image: ringImage,
          description: 'Elegant platinum ring with brilliant cut diamond',
          price: '₹85,000',
        },
        {
          id: '3',
          categoryId: '3',
          name: 'Pearl Drop Earrings',
          image: earringImage,
          description: 'Classic pearl earrings with diamond accents',
          price: '₹35,000',
        },
        {
          id: '4',
          categoryId: '4',
          name: 'Gold Tennis Bracelet',
          image: braceletImage,
          description: 'Timeless tennis bracelet in 18k gold',
          price: '₹55,000',
        },
      ];

      for (const product of products) {
        await saveProduct(product);
      }
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};
