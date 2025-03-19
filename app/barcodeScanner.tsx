import React, { useState, useEffect } from 'react';
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back'); // Set default to back camera
  const [permission, requestPermission] = useCameraPermissions(); // Request camera permissions
  const [scanned, setScanned] = useState(false); // To prevent scanning multiple times quickly
  const [productInfo, setProductInfo] = useState<any>(null); // To store product info from API

  useEffect(() => {
    if (permission?.granted) {
      // The camera is ready
    }
  }, [permission]);

  if (!permission) {
    // If the permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // If permission is not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to access the camera.</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // Toggle camera facing between front and back
  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const handleBarCodeScanned = async ({ type, data }: { type: string, data: string }) => {
    setScanned(true); // Disable further scans until reset

    console.log('Scanned Barcode Information:');
    console.log('Type:', type); // Log the type of the barcode (e.g., QR, EAN)
    console.log('Data:', data); // Log the data contained in the barcode

    // Call API to fetch product details using the barcode data
    const product = await fetchProductDetails(data);
    setProductInfo(product); // Save product info to state

    // Show an alert with the scanned data
    Alert.alert(`Product Found! Type: ${type}, Data: ${data}`);

    // Reset the scanning state after 1 second to allow another scan
    setTimeout(() => setScanned(false), 1000);
  };

  const fetchProductDetails = async (barcode: string) => {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const result = await response.json();

      if (result.product) {
        // Log the entire product info to console
        console.log('Fetched Product Info:', result.product);

        // Return product details
        return result.product;
      } else {
        Alert.alert('Product not found');
        return null;
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert('Error fetching product details');
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned} // Prevent scanning multiple times quickly
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {productInfo && (
        <ScrollView style={styles.productInfoContainer}>
          <Text style={styles.productTitle}>{productInfo.product_name || 'Product not found'}</Text>
          <Text style={styles.productDetail}>Brand: {productInfo.brands || 'N/A'}</Text>
          <Text style={styles.productDetail}>Categories: {productInfo.categories || 'N/A'}</Text>
          <Text style={styles.productDetail}>Ingredients: {productInfo.ingredients_text || 'N/A'}</Text>

          <View style={styles.nutrientContainer}>
            <Text style={styles.nutrientTitle}>--- Nutrition Facts ---</Text>
            {productInfo.nutriments ? (
              <>
                <Text style={styles.nutrientDetail}>Energy: {productInfo.nutriments['energy-kcal_100g']} kcal per 100g</Text>
                <Text style={styles.nutrientDetail}>Fat: {productInfo.nutriments['fat_100g']} g per 100g</Text>
                <Text style={styles.nutrientDetail}>Sugars: {productInfo.nutriments['sugars_100g']} g per 100g</Text>
                <Text style={styles.nutrientDetail}>Proteins: {productInfo.nutriments['proteins_100g']} g per 100g</Text>
                <Text style={styles.nutrientDetail}>Carbohydrates: {productInfo.nutriments['carbohydrates_100g']} g per 100g</Text>
              </>
            ) : (
              <Text style={styles.nutrientDetail}>Nutrition information not available.</Text>
            )}
          </View>
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
  nutrientContainer: {
    marginTop: 20,
  },
  nutrientTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  nutrientDetail: {
    fontSize: 14,
    marginBottom: 5,
  },
});
