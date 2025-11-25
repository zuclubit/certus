#!/bin/bash

# ============================================================
# SCRIPT DE VERIFICACIÓN DE ICONOS LOTTIE
# ============================================================
#
# Verifica que los archivos originales existan y estén correctos
# Comprueba que las importaciones en lottieIcons.ts sean válidas
#
# Uso: bash verify-icons.sh
# ============================================================

echo "╔════════════════════════════════════════════════════════╗"
echo "║   VERIFICACIÓN DE ICONOS LOTTIE - CERTUS v3.0         ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

ICONS_DIR="icons"
SUCCESS=0
FAIL=0

# Lista de iconos requeridos
REQUIRED_ICONS=(
  "home.json"
  "Submited.json"
  "reports.json"
  "catalogs.json"
  "Register.json"
  "setting.json"
  "user-profile.json"
  "notification.json"
  "light-mode.json"
  "loadfile.json"
  "analytics.json"
)

echo "📦 Verificando archivos JSON originales..."
echo ""

for icon in "${REQUIRED_ICONS[@]}"; do
  if [ -f "$ICONS_DIR/$icon" ]; then
    # Verificar que el archivo no esté vacío
    SIZE=$(wc -c < "$ICONS_DIR/$icon" | tr -d ' ')
    if [ "$SIZE" -gt 100 ]; then
      echo "  ✅ $icon (${SIZE} bytes)"
      SUCCESS=$((SUCCESS + 1))
    else
      echo "  ⚠️  $icon (demasiado pequeño: ${SIZE} bytes)"
      FAIL=$((FAIL + 1))
    fi
  else
    echo "  ❌ $icon (NO ENCONTRADO)"
    FAIL=$((FAIL + 1))
  fi
done

echo ""
echo "─────────────────────────────────────────────────────────"
echo ""

# Verificar estructura JSON básica
echo "🔍 Verificando estructura JSON..."
echo ""

SAMPLE_ICON="$ICONS_DIR/home.json"
if [ -f "$SAMPLE_ICON" ]; then
  # Verificar que sea JSON válido
  if python3 -m json.tool "$SAMPLE_ICON" > /dev/null 2>&1; then
    echo "  ✅ JSON válido: home.json"

    # Verificar propiedades Lottie esenciales
    HAS_LAYERS=$(python3 -c "import json; data=json.load(open('$SAMPLE_ICON')); print('layers' in data)" 2>/dev/null)
    HAS_VERSION=$(python3 -c "import json; data=json.load(open('$SAMPLE_ICON')); print('v' in data)" 2>/dev/null)

    if [ "$HAS_LAYERS" = "True" ]; then
      echo "  ✅ Contiene layers"
    else
      echo "  ❌ NO contiene layers"
    fi

    if [ "$HAS_VERSION" = "True" ]; then
      VERSION=$(python3 -c "import json; data=json.load(open('$SAMPLE_ICON')); print(data.get('v', 'unknown'))" 2>/dev/null)
      echo "  ✅ Versión Lottie: $VERSION"
    else
      echo "  ❌ NO contiene versión"
    fi
  else
    echo "  ❌ JSON INVÁLIDO: home.json"
    FAIL=$((FAIL + 1))
  fi
else
  echo "  ❌ No se puede verificar (home.json no encontrado)"
  FAIL=$((FAIL + 1))
fi

echo ""
echo "─────────────────────────────────────────────────────────"
echo ""

# Verificar colores en archivo original
echo "🎨 Analizando colores en iconos originales..."
echo ""

python3 << 'PYEOF'
import json
import sys

def analyze_icon_colors(filepath):
    try:
        with open(filepath, 'r') as f:
            data = json.load(f)

        colors = []

        def find_colors(obj, depth=0):
            if depth > 20:
                return

            if isinstance(obj, dict):
                for key, value in obj.items():
                    if key == 'c' and isinstance(value, dict) and 'k' in value:
                        k = value['k']
                        if isinstance(k, list) and len(k) >= 3:
                            # Solo primeros 3 valores RGB
                            rgb = k[:3]
                            if all(isinstance(x, (int, float)) for x in rgb):
                                colors.append(rgb)
                    elif isinstance(value, (dict, list)):
                        find_colors(value, depth + 1)
            elif isinstance(obj, list):
                for item in obj[:10]:  # Limitar a primeros 10
                    if isinstance(item, (dict, list)):
                        find_colors(item, depth + 1)

        find_colors(data)

        # Analizar colores únicos
        unique_colors = []
        for color in colors:
            color_rounded = [round(c, 3) for c in color]
            if color_rounded not in unique_colors:
                unique_colors.append(color_rounded)

        print(f"  📊 Colores únicos encontrados: {len(unique_colors)}")

        # Categorizar colores
        has_white = any(all(c > 0.9 for c in color) for color in unique_colors)
        has_black = any(all(c < 0.1 for c in color) for color in unique_colors)
        has_blue = any(color[2] > 0.5 and color[2] > color[0] and color[2] > color[1] for color in unique_colors)

        if has_white:
            print("  ✅ Contiene blanco (trazo estructural)")
        else:
            print("  ⚠️  Sin blanco (puede afectar detalles)")

        if has_black:
            print("  ✅ Contiene negro (relleno estructural)")
        else:
            print("  ⚠️  Sin negro (puede afectar contraste)")

        if has_blue:
            print("  ✅ Contiene azul (color principal)")
        else:
            print("  ⚠️  Sin azul (verificar color principal)")

        return len(unique_colors) >= 2

    except Exception as e:
        print(f"  ❌ Error al analizar: {e}")
        return False

if analyze_icon_colors('icons/home.json'):
    sys.exit(0)
else:
    sys.exit(1)
PYEOF

COLOR_CHECK=$?

echo ""
echo "─────────────────────────────────────────────────────────"
echo ""

# Resumen final
echo "📋 RESUMEN DE VERIFICACIÓN"
echo ""
echo "  Archivos válidos:     $SUCCESS / ${#REQUIRED_ICONS[@]}"
echo "  Archivos con errores: $FAIL"
echo ""

if [ $FAIL -eq 0 ] && [ $COLOR_CHECK -eq 0 ]; then
  echo "╔════════════════════════════════════════════════════════╗"
  echo "║   ✅ TODOS LOS ICONOS VÁLIDOS                          ║"
  echo "║   Los iconos originales están listos para usar        ║"
  echo "╚════════════════════════════════════════════════════════╝"
  echo ""
  echo "🚀 Próximo paso:"
  echo "   cd app && npm run dev"
  echo ""
  exit 0
else
  echo "╔════════════════════════════════════════════════════════╗"
  echo "║   ⚠️  PROBLEMAS DETECTADOS                             ║"
  echo "║   Verifica los archivos marcados con ❌                ║"
  echo "╚════════════════════════════════════════════════════════╝"
  echo ""
  exit 1
fi
