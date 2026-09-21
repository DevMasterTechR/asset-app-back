-- Un mismo codigo no puede existir dos veces, aunque se escriba distinto.
--
-- El indice unico de assetCode compara el texto tal cual, asi que "CARG-007" y
-- "CARG - 007" convivian sin problema: eran dos filas para el mismo cargador,
-- una asignada y otra suelta. De ahi salieron equipos cruzados entre
-- companeros en cuatro ocasiones distintas.
--
-- Este indice va sobre el codigo NORMALIZADO -sin espacios y en mayusculas-,
-- asi que la puerta queda cerrada venga el codigo de donde venga: el
-- formulario, HWIDApp, un script suelto o una ruta que alguien agregue el ano
-- que viene. Hasta ahora las puertas estaban cerradas; esto es la cerradura.
--
-- Es PARCIAL a proposito: solo cuenta los equipos activos. Uno dado de baja
-- conserva su historia pero no bloquea su numero, para que su reemplazo pueda
-- tomarlo (ver AssetsService.remove, que le agrega el sufijo -BAJA-<id>).
CREATE UNIQUE INDEX "Asset_assetCode_normalizado_key"
    ON "Asset" (upper(replace("assetCode", ' ', '')))
 WHERE "deletedAt" IS NULL;
