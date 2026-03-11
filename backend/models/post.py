# from sqlalchemy import Column, Integer, String, Text, ForeignKey
# from database.database import Base

# class Post(Base):
#     __tablename__ = "posts"

#     post_id = Column(Integer, primary_key=True, index=True)
#     post_title = Column(String(150), nullable=False)
#     description = Column(Text)
#     company_id = Column(Integer, ForeignKey("companies.company_id"))
