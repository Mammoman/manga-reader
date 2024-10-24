import React from "react";
import { Link } from "react-router-dom";
import '../styles/MangaCard.css';


const MangaCard = ({ manga }) => {
  
    const title = manga?.attributes?.title?.en || 'Unknown Title';
    const coverRelationship = manga?.relationships?.find(rel => rel.type === 'cover_art');
    const coverFileName = coverRelationship?.attributes?.fileName;
    const mangaId = manga?.id;
    
    
    const getCoverUrl = (size) => {
      if (!mangaId || !coverFileName) return '';
      const baseUrl = `https://uploads.mangadex.org/covers/${mangaId}/${coverFileName}`;
      if (size && (size === 256 || size === 512)) {
        return `${baseUrl}.${size}.jpg`;
      }
      return baseUrl;
    };

    const coverUrl = getCoverUrl(256); // Using 256px thumbnail, change to 512 for larger or remove for original

    const genre = manga?.attributes?.tags?.find(tag => tag.attributes.group === 'genre')?.attributes?.name?.en || 'Unknown Genre';
    const updatedAt = new Date(manga?.attributes?.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const chapterNo = manga?.attributes?.lastChapter || 'N/A';
    
    console.log('Cover URL:', coverUrl); // Debugging line

    return ( 
     <Link to={`/manga-list/${manga.id}`}>
       <div className="manga" key={manga?.id}>
        <div>
            
        </div>
        <div>
          <img
            src={coverUrl}
            alt={title}
            onError={(e) => {
              console.error('Image failed to load:', coverUrl);
              e.target.src = '/images/fallback-image.jpeg';
            }}
          />
        </div>
        <div>
          <span>{genre}</span>
          <h3>{title}</h3>
          <p>Updated: {updatedAt}</p>
          <p>Latest Chapter: {chapterNo}</p>
        </div>
      </div>
      </Link>
    );
     
       
};


export default MangaCard;
