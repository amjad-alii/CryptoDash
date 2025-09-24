package com.cryptodash.crypto_backend.controller;

import com.cryptodash.crypto_backend.entity.Article;
import com.cryptodash.crypto_backend.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    @Autowired
    private ArticleRepository articleRepository;

    @GetMapping
    public List<Article> getAllArticles() {
        // Use the new repository method to get articles sorted by ID (newest first)
        return articleRepository.findAllByOrderByIdDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Article> getArticleById(@PathVariable Long id) {
        Optional<Article> article = articleRepository.findById(id);

        if (article.isPresent()) {
            return ResponseEntity.ok(article.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public Article createArticle(@RequestBody Article article) {
        return articleRepository.save(article);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Article> updateArticle(@PathVariable Long id, @RequestBody Article updatedArticle) {
        Optional<Article> existingArticleOptional = articleRepository.findById(id);

        if (existingArticleOptional.isPresent()) {
            Article existingArticle = existingArticleOptional.get();

            // Update the fields of the existing article with data from the request body
            existingArticle.setTitle(updatedArticle.getTitle());
            existingArticle.setSummary(updatedArticle.getSummary());
            existingArticle.setImage(updatedArticle.getImage());
            existingArticle.setContent(updatedArticle.getContent());

            // Save the updated existing object back to the database
            Article savedArticle = articleRepository.save(existingArticle);
            return ResponseEntity.ok(savedArticle);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArticle(@PathVariable Long id) {
        if (articleRepository.existsById(id)) {
            articleRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}