import React, { useState, useEffect } from 'react';
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View, ScrollView, Image } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { getAuth } from 'firebase/auth';
import { addFoodToDatabase } from './addFoodToDatabase';  // Importer la fonction addFoodToDatabase

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedBarcodes, setScannedBarcodes] = useState(new Map()); // Stocke les codes scannés
  const [productInfo, setProductInfo] = useState<any>(null);

  // Variables pour stocker les informations du produit
  const [productName, setProductName] = useState<string>('');
  const [productWeight, setProductWeight] = useState<string>('');
  const [productDescription, setProductDescription] = useState<string>('');
  const [productCategory, setProductCategory] = useState<string>('');
  const [productExpiryDate, setProductExpiryDate] = useState<string>('');
  const [productBrand, setProductBrand] = useState<string>('');
  const [productIngredients, setProductIngredients] = useState<string>('');
  const [productImage, setProductImage] = useState<string>('');
  const [productNutrients, setProductNutrients] = useState<any>({});

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (permission?.granted) {
      // La caméra est prête
    }
  }, [permission]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Nous avons besoin de la permission pour accéder à la caméra.</Text>
        <Button onPress={requestPermission} title="Accorder la permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string, data: string }) => {
    if (scannedBarcodes.has(data)) {
      return; // Ignore si déjà scanné récemment
    }

    setScannedBarcodes(new Map(scannedBarcodes.set(data, Date.now())));

    // Récupérer les informations du produit
    const product = await fetchProductDetails(data);
    setProductInfo(product);

    // Mettre à jour les variables d'état avec les informations récupérées
    if (product) {
      setProductName(product.product_name || 'Produit inconnu');
      setProductWeight(product.quantity || 'N/A');
      setProductDescription(product.ingredients_text || 'Pas de description');
      setProductCategory(product.categories || 'Non catégorisé');
      setProductExpiryDate(product.expiration_date || '');  // Remplacer la valeur par une chaîne vide si manquante
      setProductBrand(product.brands || 'Marque non disponible');
      setProductIngredients(product.ingredients_text || 'Ingrédients non disponibles');
      setProductImage(product.image_url || '');
      
      // Filtrer les valeurs nutritionnelles pour ne garder que celles qui sont importantes
      const filteredNutrients = filterNutrients(product.nutriments || {});
      setProductNutrients(filteredNutrients);
    }

    // Affichage d'un message d'alerte avec les informations du produit
    Alert.alert(
      'Produit scanné',
      `Nom: ${productName}\nPoids: ${productWeight}\nDescription: ${productDescription}\nCatégorie: ${productCategory}\nDate de péremption: ${productExpiryDate || 'Non disponible'}\nMarque: ${productBrand}`
    );

    setTimeout(() => {
      setScannedBarcodes(prev => {
        const newMap = new Map(prev);
        newMap.delete(data);
        return newMap;
      });
    }, 2000); // Bloque les scans du même code pendant 2 secondes

    // Ajouter le produit à la base de données
    if (productName && productWeight && productDescription) {
      let expiryDateString = ''; // Valeur par défaut (chaîne vide) si la date est manquante ou invalide

      if (productExpiryDate && productExpiryDate !== 'Date non disponible') {
        const expiryDate = new Date(productExpiryDate);  // Conversion de la chaîne en objet Date
        if (!isNaN(expiryDate.getTime())) {  // Vérification si la date est valide
          expiryDateString = expiryDate.toISOString();  // Conversion de la date en chaîne ISO
        } else {
          console.error('Erreur: Date de péremption invalide', productExpiryDate);
          expiryDateString = ''; // Si la date est invalide, la remplacer par une chaîne vide
        }
      }

      // On assure que productIngredients est toujours une chaîne
      const ingredients = productIngredients || ''; // Si null, utiliser une chaîne vide

      // Ajouter un produit à la base de données avec les arguments nécessaires
      await addFoodToDatabase(
        user?.uid || '',  // UID de l'utilisateur connecté
        productName,
        productWeight,
        '1',  // Quantité par défaut
        productDescription,
        expiryDateString,  // Passer la date convertie ou une chaîne vide si invalide
        productImage,
        productBrand,
        ingredients, // On passe une chaîne vide si null
        productNutrients,
        productCategory  // Ajouter la catégorie du produit
      );

      console.log('Produit ajouté à la base de données');
    }
  };

  // Fonction pour filtrer les nutriments et garder seulement ceux d'intérêt
  const filterNutrients = (nutrients: any) => {
    const allowedNutrients = [
      'proteins',     // Protéines
      'carbohydrates', // Glucides
      'fat',           // Lipides
      'fiber',         // Fibres
      'sugars',        // Sucres
      'salt',          // Sel
      'energy',        // Énergie (calories)
      'saturated-fat', // Graisses saturées
    ];

    const filteredNutrients: any = {};

    for (const [key, value] of Object.entries(nutrients)) {
      if (allowedNutrients.includes(key)) {
        filteredNutrients[key] = value;
      }
    }

    return filteredNutrients;
  };

  const fetchProductDetails = async (barcode: string) => {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const result = await response.json();

      if (result.product) {
        return result.product;
      } else {
        Alert.alert('Produit non trouvé');
        return null;
      }
    } catch (error) {
      console.error('Erreur API:', error);
      Alert.alert('Erreur lors de la récupération du produit');
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={handleBarCodeScanned} 
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Changer Caméra</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {productInfo && (
        <ScrollView style={styles.productInfoContainer}>
          <Text style={styles.productTitle}>Nom: {productName}</Text>
          <Text style={styles.productDetail}>Poids: {productWeight}</Text>
          <Text style={styles.productDetail}>Marque: {productBrand}</Text>
          <Text style={styles.productDetail}>Description: {productDescription}</Text>
          <Text style={styles.productDetail}>Catégorie: {productCategory}</Text>
          <Text style={styles.productDetail}>Date de péremption: {productExpiryDate}</Text>
          
          {/* Affichage des informations nutritionnelles */}
          <Text style={styles.productDetail}>Valeurs nutritionnelles:</Text>
          {Object.keys(productNutrients).length > 0 ? (
            Object.entries(productNutrients).map(([key, value]) => (
              <Text key={key} style={styles.productDetail}>{`${key}: ${value}`}</Text>
            ))
          ) : (
            <Text style={styles.productDetail}>Valeurs nutritionnelles non disponibles</Text>
          )}

          {/* Affichage de l'image du produit */}
          {productImage && <Image source={{ uri: productImage }} style={styles.productImage} />}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  productInfoContainer: {
    padding: 20,
    backgroundColor: 'white',
    flex: 1,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productDetail: {
    fontSize: 16,
    marginBottom: 8,
  },
  productImage: {
    width: 150,
    height: 150,
    marginTop: 10,
  },
});
