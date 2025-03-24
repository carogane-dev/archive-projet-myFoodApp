import { getAuth } from 'firebase/auth';
import { getFirestore, addDoc, collection, Timestamp } from 'firebase/firestore';

// Liste des catégories valides
const validCategories = [
  'Fruits', 'Légumes', 'Viandes', 'Poissons', 'Boissons', 'Produits laitiers', 'Céréales', 'Condiments', 'Snacks', 'Autres'
];

// Fonction pour détecter la catégorie d'un produit à partir de sa description
function detectCategory(description: string, ingredients: string[]): string {
  const categories: { [key: string]: string[] } = {
    viandes: [
      'poulet', 'boeuf', 'saucisse', 'poisson', 'saumon', 'thon', 'dinde', 'agneau', 
      'canard', 'lapin', 'porc', 'veau', 'sanglier', 'truite', 'carpe', 'moules', 'crevettes', 
      'calmars', 'escargots', 'huîtres', 'homard', 'langouste', 'crabe', 'caille', 'merlan', 'sole',
      'boudin', 'steak', 'hamburger', 'bacon', 'saucisson', 'charcuterie', 'salami'
    ],
    fruits: [
      'pomme', 'banane', 'orange', 'raisin', 'kiwi', 'mangue', 'ananas', 'poire', 'fraise', 
      'framboise', 'cerise', 'melon', 'abricot', 'nectarine', 'pêche', 'mûre', 'prune', 
      'grenade', 'litchi', 'papaye', 'citrons', 'clémentine', 'figue', 'date', 'fruit de la passion',
      'pamplemousse', 'cassis', 'coing', 'rhubarbe', 'kumquat'
    ],
    legumes: [
      'carotte', 'tomate', 'courgette', 'brocoli', 'poivron', 'épinard', 'haricot', 'chou', 
      'aubergine', 'petits pois', 'fèves', 'champignon', 'navet', 'celeri', 'concombre', 
      'betterave', 'patate douce', 'courge', 'laitue', 'salade', 'radis', 'cresson', 'endive', 
      'fenouil', 'blette', 'artichaut', 'salsifis', 'brocoli-rave', 'coriandre', 'menthe', 'basilic', 
      'romarin', 'thym', 'estragon', 'sauge', 'ail', 'oignon', 'poireau', 'asperge'
    ],
    cereales: [
      'riz', 'quinoa', 'blé', 'orge', 'avoine', 'semoule', 'sarrasin', 'millet', 'épeautre', 
      'maïs', 'couscous', 'farro', 'orge perlé', 'seigle', 'blé dur', 'riz basmati', 
      'riz sauvage', 'épeautre', 'corn flakes', 'flocons d’avoine', 'granola', 'sarrasin', 'polenta',
      'pâtes', 'spaghetti', 'macaroni', 'fusilli', 'gnocchis', 'ramen', 'udon', 'vermicelles'
    ],
    produitsLaitiers: [
      'lait', 'fromage', 'yaourt', 'crème', 'beurre', 'fromage blanc', 'kefir', 
      'lait en poudre', 'yaourt nature', 'yaourt grec', 'yaourt à boire', 'fromage râpé', 
      'fromage frais', 'fromage affiné', 'gorgonzola', 'roquefort', 'camembert', 'brie', 'cheddar', 
      'mozzarella', 'emmental', 'parmesan', 'ricotta', 'gruyère', 'feta', 'tartare', 'lait de vache', 
      'lait de chèvre', 'lait de brebis', 'mascarpone', 'crème fouettée', 'yaourt soja', 'lait de coco',
      'crème fraîche', 'lait d’amande', 'fromage de chèvre', 'fromage à pâte molle', 'fromage à pâte dure'
    ],
    boissons: [
      'eau', 'jus', 'café', 'thé', 'bière', 'vin', 'boisson énergétique', 'soda', 'limonade', 
      'cocktail', 'whisky', 'rhum', 'vodka', 'tequila', 'champagne', 'mojito', 'sangria', 
      'margarita', 'smoothie', 'lait frappé', 'boisson gazeuse', 'eau pétillante', 'eau plate', 
      'boisson gazeuse sans sucre', 'boisson sans alcool', 'granité', 'kombucha', 'infusion', 'boisson chaude',
      'coca cola', 'pepsi', 'fanta', 'sprite', 'sunkist', '7up', 'monster', 'red bull', 'lipton', 
      'vittel', 'evian', 'badoit', 'heineken', 'corona', 'guinness', 'desperados', 'chivas regal', 
      'johnnie walker', 'absolut', 'bacardi', 'perrier', 'la croix', 'san pellegrino'
    ],
    condiments: [
      'sel', 'poivre', 'moutarde', 'ketchup', 'vinaigre', 'huile', 'sauce soja', 'sauce tomate', 
      'mayonnaise', 'sauce béarnaise', 'sauce curry', 'sauce barbecue', 'sauce piquante', 'tabasco', 
      'sauces épicées', 'sauce au fromage', 'sauce tartare', 'pesto', 'sauce à l’ail', 'sauce à la crème', 
      'sauce chimichurri', 'huile d’olive', 'huile de tournesol', 'huile de sésame', 'huile d’avocat', 
      'huile de coco', 'mélange d’épices', 'cumin', 'paprika', 'curry', 'curcuma', 'gingembre', 'piment', 
      'cannelle', 'clou de girofle', 'aneth', 'origan', 'herbes de Provence', 'safran', 'sel de mer', 'sel rose',
      'gingembre frais', 'graines de moutarde', 'mélange 5 épices'
    ],
    snacks: [
      'chips', 'croustilles', 'popcorn', 'barres granola', 'bonbons', 'chocolat', 'gâteaux', 'cookies', 
      'biscuits', 'crêpes', 'barres de céréales', 'barres chocolatées', 'nougat', 'gâteaux apéritifs', 
      'sablés', 'madeleines', 'bouchées au chocolat', 'caramel', 'gelées', 'bonbons gélifiés', 'nougatine', 
      'fruits secs', 'noix', 'amandes', 'cacahuètes', 'pistaches', 'noisettes', 'graines de tournesol', 
      'pop corn sucré', 'pop corn salé', 'tartines', 'crackers', 'chips de légumes', 'chips de maïs', 'cheese balls',
      'barres protéinées', 'gâteaux secs', 'barres au chocolat blanc', 'bonbons acidulés', 'sucettes', 'dragées',
      'barres énergétiques', 'bouchées énergétiques'
    ]
  };

  // Vérifier dans quelle catégorie la description ou les ingrédients correspondent
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => description.toLowerCase().includes(keyword) || ingredients.some(ingredient => ingredient.toLowerCase().includes(keyword)))) {
      return category.charAt(0).toUpperCase() + category.slice(1); // Retourne la catégorie trouvée avec la première lettre en majuscule
    }
  }

  // Si aucune correspondance n'est trouvée, retourner "Autres"
  return 'Autres';
}

// Fonction pour ajouter un produit à la base de données
export const addFoodToDatabase = async (
  userId: string,
  productName: string,
  productWeight: string,
  quantity: string,
  productDescription: string,
  expiryDate: string,
  productImage: string,
  productBrand: string,
  productIngredients: string,
  productNutrients: any,
  productCategory: string
) => {
  try {
    const db = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("L'utilisateur n'est pas authentifié.");
      return;
    }

    // Si la catégorie du produit est déjà définie, on la garde, sinon on la détecte
    const finalCategory = (productCategory && productCategory !== "Non catégorisé") ? productCategory : detectCategory(productDescription, productIngredients.split(','));

    // Si la date d'expiration est vide ou invalide, utiliser la date actuelle formatée
    const expiry = expiryDate ? new Date(expiryDate).toISOString() : new Date().toISOString();

    // Préparer les données à ajouter dans Firestore
    const foodData = {
      userId: userId,
      productName,
      productWeight,
      quantity,
      productDescription,
      productCategory: finalCategory, // Utiliser la catégorie finale (soit celle définie, soit détectée)
      expiryDate: expiry,
      productImage,
      productBrand,
      productIngredients,
      productNutrients: productNutrients || {},
    };

    // Ajouter le produit à Firestore
    const docRef = await addDoc(collection(db, 'foods'), foodData);

    console.log("Produit ajouté avec succès avec l'ID :", docRef.id);
  } catch (error) {
    console.error("Erreur lors de l'ajout du produit:", error);
  }
};
