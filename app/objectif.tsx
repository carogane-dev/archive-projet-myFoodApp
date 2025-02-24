import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from "react-native";

interface Dimensions {
  L: string;
  l: string;
  h: string;
}

export default function ObjectifJour() {
  const [proteinesCibles, setProteinesCibles] = useState<number>(0);
  const [glucidesCibles, setGlucidesCibles] = useState<number>(0);
  const [lipidesCibles, setLipidesCibles] = useState<number>(0);

  const [dimensions, setDimensions] = useState<Dimensions[]>([
    { L: "", l: "", h: "" }, // Poulet
    { L: "", l: "", h: "" }, // Riz
    { L: "", l: "", h: "" }, // Haricots
  ]);

  const [resultats, setResultats] = useState<number[]>([0, 0, 0]);
  const [finalProteines, setFinalProteines] = useState<number>(0);
  const [finalGlucides, setFinalGlucides] = useState<number>(0);
  const [finalLipides, setFinalLipides] = useState<number>(0);
  const [finalError, setFinalError] = useState<number>(0);

  const [coefficientsFinals, setCoefficientsFinals] = useState<number[]>([0, 0, 0]);
  const [coefficientsAjustes, setCoefficientsAjustes] = useState<number[]>([0, 0, 0]);

  const [resultatsAvant, setResultatsAvant] = useState<number[]>([0, 0, 0]);
  const [resultatsApres, setResultatsApres] = useState<number[]>([0, 0, 0]);

  const [pourcentages, setPourcentages] = useState<string[]>(["", "", ""]);

  const handleDimensionChange = (index: number, field: keyof Dimensions, value: string) => {
    const newDimensions = [...dimensions];
    newDimensions[index][field] = value;
    setDimensions(newDimensions);
  };

  // Cette fonction manipule les coefficients finaux en testant toutes les combinaisons de -10% et +10%
  const ajusterCoefficients = (coeffs: number[], objets: number[][]) => {
    const ajustements = [
      (coeff: number) => coeff * 0.9,  // -10%
      (coeff: number) => coeff * 1.1,  // +10%
      (coeff: number) => coeff,       // Pas de changement
    ];

    let bestError = Infinity;
    let bestCoeffs = [...coeffs];
    let bestResults = { totalProtéines: 0, totalGlucides: 0, totalLipides: 0 };
    let bestPourcentages = ["", "", ""]; // Stocker les pourcentages appliqués

    let bestCombinations: {coeffs: number[], percentages: string[], results: any}[] = [];

    // Boucles pour tester toutes les combinaisons de -10%, 0%, +10%
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          const adjustedCoeffs = [
            ajustements[i](coeffs[0]),
            ajustements[j](coeffs[1]),
            ajustements[k](coeffs[2]),
          ];

          let totalProtéines = 0;
          let totalGlucides = 0;
          let totalLipides = 0;

          // Calcul des valeurs totales avec les coefficients ajustés
          for (let n = 0; n < 3; n++) {
            totalProtéines += objets[n][0] * adjustedCoeffs[n];
            totalGlucides += objets[n][1] * adjustedCoeffs[n];
            totalLipides += objets[n][2] * adjustedCoeffs[n];
          }

          let error =
            Math.abs(proteinesCibles - totalProtéines) +
            Math.abs(glucidesCibles - totalGlucides) +
            Math.abs(lipidesCibles - totalLipides);

          if (
            totalProtéines <= proteinesCibles &&
            totalGlucides <= glucidesCibles &&
            totalLipides <= lipidesCibles &&
            error < bestError
          ) {
            bestError = error;
            bestCoeffs = [...adjustedCoeffs];
            bestResults = { totalProtéines, totalGlucides, totalLipides };
            bestPourcentages = [
              i === 0 ? "-10%" : i === 1 ? "0%" : "+10%",
              j === 0 ? "-10%" : j === 1 ? "0%" : "+10%",
              k === 0 ? "-10%" : k === 1 ? "0%" : "+10%",
            ];

            bestCombinations.push({ coeffs: adjustedCoeffs, percentages: bestPourcentages, results: bestResults });
          }
        }
      }
    }

    // Retourner l'objet contenant les meilleurs résultats
    return {
      bestCoeffs: bestCoeffs,
      bestResults: bestResults,
      bestPourcentages: bestPourcentages
    };
  };

  const calculateScalingFactors = () => {
    const valeursCibles = [proteinesCibles, glucidesCibles, lipidesCibles];
    const valeursAliment = [
      [parseFloat(dimensions[0].L), parseFloat(dimensions[0].l), parseFloat(dimensions[0].h)], // Poulet
      [parseFloat(dimensions[1].L), parseFloat(dimensions[1].l), parseFloat(dimensions[1].h)], // Riz
      [parseFloat(dimensions[2].L), parseFloat(dimensions[2].l), parseFloat(dimensions[2].h)], // Haricots
    ];

    let coeffsInitiaux = [1 / 4, 1 / 4, 1 / 2]; // Poulet, Riz, Haricots
    let coeffs = [...coeffsInitiaux];

    let bestError = Infinity;
    let bestCoeffs = [...coeffs];

    for (let i = 0; i < 1000; i++) {
      let totalProtéines = 0;
      let totalGlucides = 0;
      let totalLipides = 0;

      for (let j = 0; j < 3; j++) {
        totalProtéines += valeursAliment[j][0] * coeffs[j];
        totalGlucides += valeursAliment[j][1] * coeffs[j];
        totalLipides += valeursAliment[j][2] * coeffs[j];
      }

      if (totalProtéines <= proteinesCibles && totalGlucides <= glucidesCibles && totalLipides <= lipidesCibles) {
        let error =
          Math.abs(proteinesCibles - totalProtéines) +
          Math.abs(glucidesCibles - totalGlucides) +
          Math.abs(lipidesCibles - totalLipides);

        if (error < bestError) {
          bestError = error;
          bestCoeffs = [...coeffs];
        }
      }

      coeffs[0] = bestCoeffs[0] * (1 + 0.01); // Poulet
      coeffs[1] = bestCoeffs[1] * (1 + 0.01); // Riz
      coeffs[2] = bestCoeffs[2] * (1 + 0.01); // Haricots
    }

    setCoefficientsFinals(bestCoeffs);

    let totalProtéines = 0;
    let totalGlucides = 0;
    let totalLipides = 0;

    for (let j = 0; j < 3; j++) {
      totalProtéines += valeursAliment[j][0] * bestCoeffs[j];
      totalGlucides += valeursAliment[j][1] * bestCoeffs[j];
      totalLipides += valeursAliment[j][2] * bestCoeffs[j];
    }

    setFinalProteines(totalProtéines);
    setFinalGlucides(totalGlucides);
    setFinalLipides(totalLipides);
    setFinalError(bestError);

    // Application des ajustements sur les coefficients
    const { bestCoeffs: bestAdjustedCoeffs, bestResults, bestPourcentages } = ajusterCoefficients(bestCoeffs, valeursAliment);

    // Mise à jour des coefficients ajustés
    setCoefficientsAjustes(bestAdjustedCoeffs);

    // Mise à jour des résultats avant et après ajustement
    setResultatsAvant([totalProtéines, totalGlucides, totalLipides]);
    setResultatsApres([bestResults.totalProtéines, bestResults.totalGlucides, bestResults.totalLipides]);
    setFinalProteines(bestResults.totalProtéines);
    setFinalGlucides(bestResults.totalGlucides);
    setFinalLipides(bestResults.totalLipides);
    setFinalError(
      Math.abs(proteinesCibles - bestResults.totalProtéines) +
        Math.abs(glucidesCibles - bestResults.totalGlucides) +
        Math.abs(lipidesCibles - bestResults.totalLipides)
    );

    // Mise à jour des pourcentages appliqués
    setPourcentages(bestPourcentages);
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Objectif du Jour</Text>

        <Text>Protéines Cibles (g)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={proteinesCibles.toString()}
          onChangeText={(value) => setProteinesCibles(parseFloat(value))}
        />
        <Text>Glucides Cibles (g)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={glucidesCibles.toString()}
          onChangeText={(value) => setGlucidesCibles(parseFloat(value))}
        />
        <Text>Lipides Cibles (g)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={lipidesCibles.toString()}
          onChangeText={(value) => setLipidesCibles(parseFloat(value))}
        />

        {dimensions.map((dim, index) => (
          <View key={index} style={styles.alimentContainer}>
            <Text style={styles.alimentTitle}>{`Aliment ${index + 1}`}</Text>
            <TextInput
              style={styles.input}
              placeholder="Protéines"
              keyboardType="numeric"
              value={dim.L}
              onChangeText={(text) => handleDimensionChange(index, "L", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Glucides"
              keyboardType="numeric"
              value={dim.l}
              onChangeText={(text) => handleDimensionChange(index, "l", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Lipides"
              keyboardType="numeric"
              value={dim.h}
              onChangeText={(text) => handleDimensionChange(index, "h", text)}
            />
          </View>
        ))}

        <Button title="Valider l'objectif" onPress={calculateScalingFactors} />

        {finalError > 0 && (
          <View style={styles.resultContainer}>
            <Text>Protéines obtenues : {finalProteines.toFixed(2)}</Text>
            <Text>Glucides obtenus : {finalGlucides.toFixed(2)}</Text>
            <Text>Lipides obtenus : {finalLipides.toFixed(2)}</Text>
            <Text>Erreur totale : {finalError.toFixed(2)}</Text>

            <Text style={styles.subtitle}>Coefficients avant ajustement :</Text>
            <Text>{coefficientsFinals.join(", ")}</Text>

            <Text style={styles.subtitle}>Pourcentages appliqués :</Text>
            <Text>Aliment 1 : {pourcentages[0]}</Text>
            <Text>Aliment 2 : {pourcentages[1]}</Text>
            <Text>Aliment 3 : {pourcentages[2]}</Text>

            <Text style={styles.subtitle}>Coefficients finaux ajustés :</Text>
            <Text>{coefficientsAjustes.join(", ")}</Text>

            <Text style={styles.subtitle}>Protéines, Glucides, Lipides avant ajustement :</Text>
            <Text>Protéines: {resultatsAvant[0].toFixed(2)}, Glucides: {resultatsAvant[1].toFixed(2)}, Lipides: {resultatsAvant[2].toFixed(2)}</Text>

            <Text style={styles.subtitle}>Protéines, Glucides, Lipides après ajustement :</Text>
            <Text>Protéines: {resultatsApres[0].toFixed(2)}, Glucides: {resultatsApres[1].toFixed(2)}, Lipides: {resultatsApres[2].toFixed(2)}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f4f4f4" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: "bold", marginTop: 10 },
  inputGroup: { marginBottom: 20 },
  input: { height: 40, borderColor: "#ccc", borderWidth: 1, marginBottom: 10, paddingLeft: 8, borderRadius: 5 },
  alimentContainer: { marginBottom: 20, backgroundColor: "#fff", padding: 15, borderRadius: 8, elevation: 3 },
  alimentTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  resultContainer: { marginTop: 10, padding: 10, backgroundColor: "#f0f0f0", borderRadius: 5, marginBottom: 20 },
});
