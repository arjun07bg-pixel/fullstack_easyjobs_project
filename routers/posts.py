# from fastapi import APIRouter, Depends, HTTPException
# from sqlalchemy.orm import Session
# from dependencies import get_db
# from models.post import Post
# from schemas.post import PostCreate, PostOut
# # from models.company import Company

# router = APIRouter(prefix="/posts", tags=["Posts"])


# # ---------------- CREATE POST ----------------
# @router.post("/", response_model=PostOut)
# def create_post(post: PostCreate, db: Session = Depends(get_db)):
#     new_post = Post(**post.dict())
#     db.add(new_post)
#     db.commit()
#     db.refresh(new_post)
#     return new_post



# # ---------------- GET ALL POSTS ----------------
# @router.get("/", response_model=list[PostOut])
# def get_posts(db: Session = Depends(get_db)):
#     return db.query(Post).all()




# # ---------------- GET SINGLE POST ----------------
# @router.get("/{post_id}", response_model=PostOut)
# def get_post(post_id: int, db: Session = Depends(get_db)):
#     post = db.query(Post).filter(Post.post_id == post_id).first()
#     if not post:
#         raise HTTPException(status_code=404, detail="Post not found")
#     return post




# # ---------------- UPDATE POST ----------------
# @router.put("/{post_id}", response_model=PostOut)
# def update_post(post_id: int, post: PostCreate, db: Session = Depends(get_db)):
#     db_post = db.query(Post).filter(Post.post_id == post_id).first()
#     if not db_post:
#         raise HTTPException(status_code=404, detail="Post not found")

#     db_post.post_title = post.post_title
#     db_post.description = post.description
#     db_post.company_id = post.company_id

#     db.commit()
#     db.refresh(db_post)
#     return db_post






# # ---------------- DELETE POST ----------------
# @router.delete("/{post_id}", status_code=200)
# def delete_post(post_id: int, db: Session = Depends(get_db)):
#     db_post = db.query(Post).filter(Post.post_id == post_id).first()
#     if not db_post:
#         raise HTTPException(status_code=404, detail="Post not found")

#     db.delete(db_post)
#     db.commit()
#     return {"detail": "Post deleted successfully"}
