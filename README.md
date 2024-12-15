Denne README fil vil guide dig i at starte vores applikation som en localhost server ved brug af Node.js

1. Vi vil anbefale at starte med at slette mappen "node-modules", da installationen kan variere på forskellige operative systemer og versioner af Node.js.
2. Nu kan du åbne en terminal og navigere til mappen "joe-projekt", hvor du skal køre en "npm install" for at installere "node modules" igen.
3. Herefter skal du indsætte de nødvendige nøgler som applikationen skal bruge. Det drejer sig om cloudinary nøgler i filerne products.js og tutorials.js hvis man ønsker at uploade billederne til en privat cloudinary. Derudover skal twillio nøgler i filen app.js erstattes. 
4. Nu kan applikationen startes ved at køre "node app.js" i terminalen.
5. Problemer opstår ofte med node modulerne "sqlite3" og "bcrypt". Her anbefaler vi at køre en npm uninstall og install på begge moduler. 
